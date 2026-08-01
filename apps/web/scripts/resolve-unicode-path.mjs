import { access, readdir } from "node:fs/promises";
import path from "node:path";

export async function resolveUnicodePath(...parts) {
  const requestedPath = path.resolve(...parts);

  try {
    await access(requestedPath);
    return requestedPath;
  } catch {
    // macOS commonly stores accented names as NFD while manifests use NFC.
  }

  const parsed = path.parse(requestedPath);
  const segments = requestedPath.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let currentPath = parsed.root;

  for (const segment of segments) {
    const entries = await readdir(currentPath);
    const normalizedSegment = segment.normalize("NFC");
    const matchingEntry = entries.find(
      (entry) => entry.normalize("NFC") === normalizedSegment,
    );

    if (!matchingEntry) {
      const error = new Error(`Path segment not found: ${segment}`);
      error.code = "ENOENT";
      throw error;
    }

    currentPath = path.join(currentPath, matchingEntry);
  }

  return currentPath;
}
