import re
from dataclasses import dataclass
from io import BytesIO
from pathlib import PurePosixPath
from zipfile import BadZipFile, ZipFile


class UnsafeImportError(ValueError):
    pass


@dataclass(frozen=True)
class ImportedText:
    content: str
    source_files: int


_EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
_URL = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_PHONE = re.compile(r"(?<!\w)(?:\+?\d[\d .()\-]{7,}\d)(?!\w)")


def redact_sensitive_text(content: str) -> str:
    content = _EMAIL.sub("[correo omitido]", content)
    content = _URL.sub("[enlace omitido]", content)
    return _PHONE.sub("[teléfono omitido]", content)


def decode_text(payload: bytes) -> str:
    if b"\x00" in payload:
        raise UnsafeImportError("Binary content is not allowed")
    try:
        return payload.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise UnsafeImportError("Only UTF-8 text is accepted") from error


def import_txt(payload: bytes, *, max_characters: int) -> ImportedText:
    content = decode_text(payload).strip()
    if not content or len(content) > max_characters:
        raise UnsafeImportError("Text length is outside the allowed range")
    return ImportedText(content=content, source_files=1)


def import_txt_zip(
    payload: bytes,
    *,
    max_characters: int,
    max_files: int = 20,
    max_uncompressed_bytes: int = 2_000_000,
) -> ImportedText:
    if len(payload) > 1_000_000:
        raise UnsafeImportError("Archive is too large")
    try:
        archive = ZipFile(BytesIO(payload))
    except BadZipFile as error:
        raise UnsafeImportError("Invalid ZIP archive") from error

    entries = [entry for entry in archive.infolist() if not entry.is_dir()]
    if not entries or len(entries) > max_files:
        raise UnsafeImportError("Unexpected number of files")
    if sum(entry.file_size for entry in entries) > max_uncompressed_bytes:
        raise UnsafeImportError("Archive expands beyond the allowed size")

    texts: list[str] = []
    for entry in entries:
        path = PurePosixPath(entry.filename)
        if path.is_absolute() or ".." in path.parts:
            raise UnsafeImportError("Unsafe archive path")
        if path.suffix.casefold() != ".txt":
            raise UnsafeImportError("ZIP archives may contain only TXT files")
        if entry.compress_size and entry.file_size / entry.compress_size > 100:
            raise UnsafeImportError("Suspicious compression ratio")
        texts.append(decode_text(archive.read(entry)).strip())

    content = "\n\n".join(text for text in texts if text)
    if not content or len(content) > max_characters:
        raise UnsafeImportError("Combined text exceeds the allowed length")
    return ImportedText(content=content, source_files=len(entries))
