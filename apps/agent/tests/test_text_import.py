from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile

import pytest

from app.cases.text_import import UnsafeImportError, import_txt_zip


def archive(entries: dict[str, str]) -> bytes:
    buffer = BytesIO()
    with ZipFile(buffer, "w", ZIP_DEFLATED) as output:
        for path, content in entries.items():
            output.writestr(path, content)
    return buffer.getvalue()


def test_imports_only_utf8_txt_files():
    result = import_txt_zip(
        archive({"chat-1.txt": "Hola", "folder/chat-2.txt": "¿Cómo estás?"}),
        max_characters=100,
    )
    assert result.source_files == 2
    assert "Hola" in result.content


def test_rejects_path_traversal():
    with pytest.raises(UnsafeImportError):
        import_txt_zip(
            archive({"../outside.txt": "unsafe"}),
            max_characters=100,
        )


def test_rejects_non_txt_files():
    with pytest.raises(UnsafeImportError):
        import_txt_zip(
            archive({"payload.html": "<script />"}),
            max_characters=100,
        )
