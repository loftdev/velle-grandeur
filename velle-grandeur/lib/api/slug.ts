const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function parseSlugOrId(slugOrId: string) {
  if (uuidRegex.test(slugOrId)) {
    return { id: slugOrId, slug: null };
  }

  const parts = slugOrId.split("-");
  if (parts.length < 6) {
    return { id: null, slug: null };
  }

  const maybeId = parts.slice(-5).join("-");
  const slug = parts.slice(0, -5).join("-");
  if (!uuidRegex.test(maybeId)) {
    return { id: null, slug: null };
  }

  return { id: maybeId, slug };
}

export function buildSlugId(slug: string, id: string) {
  return `${slug}-${id}`;
}
