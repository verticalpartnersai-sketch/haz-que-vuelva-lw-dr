#!/usr/bin/env python3
"""Convert approved Spanish products to Markdown chunks and publish them."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import logging
import os
import re
import subprocess
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Source:
    product_code: str
    title: str
    relative_path: str
    kind: str = "markdown"


SOURCES = (
    Source(
        "haz_que_vuelva",
        "Haz Que Vuelva — Protocolo de 7 días",
        "00. Produto FRONT/01_Haz_Que_Vuelva_Protocolo_7_Dias_FINAL.pdf",
        "pdf",
    ),
    Source(
        "21_mensajes",
        "21 Mensajes de Reconexión",
        "01. Produto ORDER-BUMP/Fontes/ES/"
        "ORDER-BUMP 1 - 21 Mensajes de Reconexión - ES.md",
    ),
    Source(
        "la_otra",
        "La Otra — Plan de Reconquista",
        "01. Produto ORDER-BUMP/Fontes/ES/"
        "ORDER-BUMP 2 - La Otra - Plan de Reconquista - ES.md",
    ),
    Source(
        "reconquista_30",
        "Reconquista 30",
        "02. Produto UPSELL/Fontes/ES/UPSELL 1 - Reconquista 30 - ES.md",
    ),
)


def pdf_to_markdown(path: Path, title: str) -> str:
    process = subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    pages = [page.strip() for page in process.stdout.split("\f") if page.strip()]
    sections = [f"# {title}"]
    sections.extend(f"## Página {index}\n\n{page}" for index, page in enumerate(pages, 1))
    return "\n\n".join(sections)


def normalize_markdown(content: str) -> str:
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    content = re.sub(r"[ \t]+\n", "\n", content)
    content = re.sub(r"\n{3,}", "\n\n", content)
    return content.strip()


def chunks(content: str, target: int = 1_600, overlap: int = 220) -> list[str]:
    paragraphs = [item.strip() for item in content.split("\n\n") if item.strip()]
    result: list[str] = []
    current = ""
    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}".strip()
        if current and len(candidate) > target:
            result.append(current)
            current = f"{current[-overlap:]}\n\n{paragraph}".strip()
        else:
            current = candidate
    if current:
        result.append(current)
    return result


class Publisher:
    def __init__(self) -> None:
        url = os.environ["SUPABASE_URL"].rstrip("/")
        secret = os.environ["SUPABASE_SECRET_KEY"]
        self._gemini_key = os.environ.get("GEMINI_API_KEY")
        self._client = httpx.AsyncClient(
            base_url=f"{url}/rest/v1",
            headers={"apikey": secret, "Authorization": f"Bearer {secret}"},
            timeout=90,
        )
        self._gemini = httpx.AsyncClient(
            base_url="https://generativelanguage.googleapis.com/v1beta",
            timeout=90,
        )

    async def close(self) -> None:
        await self._client.aclose()
        await self._gemini.aclose()

    async def embedding(self, text: str) -> list[float] | None:
        if not self._gemini_key:
            return None
        response = await self._gemini.post(
            "/models/gemini-embedding-2:embedContent",
            headers={"x-goog-api-key": self._gemini_key},
            json={
                "model": "models/gemini-embedding-2",
                "content": {"parts": [{"text": text}]},
                "outputDimensionality": 768,
            },
        )
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            # A knowledge publication must remain recoverable when the embedding
            # provider is temporarily rate-limited or out of credit. PostgreSQL
            # still indexes every chunk lexically; vectors can be backfilled on
            # the next idempotent run after billing is restored.
            logger.warning(
                "Embedding unavailable (%s); continuing with lexical indexing",
                error.response.status_code,
            )
            self._gemini_key = None
            return None
        return response.json()["embedding"]["values"]

    async def publish_prompt(self, prompt: str, admin_email: str) -> None:
        response = await self._client.post(
            "/rpc/publish_ai_prompt_service",
            json={"p_prompt": prompt, "p_admin_email": admin_email},
        )
        response.raise_for_status()

    async def publish_source(self, source: Source, content: str) -> int:
        source_hash = hashlib.sha256(content.encode()).hexdigest()
        existing = await self._client.get(
            "/ai_documents",
            params={
                "select": "id,source_hash",
                "product_code": f"eq.{source.product_code}",
                "scope": "eq.global",
            },
        )
        existing.raise_for_status()
        rows = existing.json()
        for row in rows:
            if row["source_hash"] != source_hash:
                continue
            chunk_probe = await self._client.get(
                "/ai_chunks",
                params={
                    "select": "id",
                    "document_id": f"eq.{row['id']}",
                    "limit": "1",
                },
            )
            chunk_probe.raise_for_status()
            if chunk_probe.json():
                return 0
        for row in rows:
            response = await self._client.delete(f"/ai_documents?id=eq.{row['id']}")
            response.raise_for_status()
        document = await self._client.post(
            "/ai_documents",
            headers={"Prefer": "return=representation"},
            json={
                "scope": "global",
                "title": source.title,
                "storage_path": f"knowledge/{source.product_code}/{source_hash}.md",
                "product_code": source.product_code,
                "source_hash": source_hash,
                "published_at": datetime.now(UTC).isoformat(),
            },
        )
        document.raise_for_status()
        document_id = document.json()[0]["id"]
        prepared = chunks(content)
        payload = []
        for chunk in prepared:
            payload.append(
                {
                    "document_id": document_id,
                    "content": chunk,
                    "embedding": await self.embedding(chunk),
                }
            )
        for offset in range(0, len(payload), 25):
            response = await self._client.post(
                "/ai_chunks",
                json=payload[offset : offset + 25],
            )
            response.raise_for_status()
        return len(prepared)


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--oracle-products", required=True, type=Path)
    parser.add_argument("--prompt", required=True, type=Path)
    parser.add_argument("--admin-email", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    prepared: list[tuple[Source, str]] = []
    for source in SOURCES:
        path = args.oracle_products / source.relative_path
        raw = pdf_to_markdown(path, source.title) if source.kind == "pdf" else path.read_text()
        prepared.append((source, normalize_markdown(raw)))
    if args.dry_run:
        for source, content in prepared:
            print(source.product_code, len(content), len(chunks(content)))
        return
    publisher = Publisher()
    try:
        await publisher.publish_prompt(args.prompt.read_text(), args.admin_email)
        for source, content in prepared:
            count = await publisher.publish_source(source, content)
            print(source.product_code, count)
    finally:
        await publisher.close()


if __name__ == "__main__":
    asyncio.run(main())
