export type ListingCursor = {
  publishedAt: string;
  id: string;
};

export function encodeCursor(cursor: ListingCursor) {
  return Buffer.from(`${cursor.publishedAt}|${cursor.id}`).toString("base64");
}

export function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    const [publishedAt, id] = decoded.split("|");
    if (!publishedAt || !id) return null;
    return { publishedAt, id } as ListingCursor;
  } catch {
    return null;
  }
}
