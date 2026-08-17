/** Gera slug amigável a URL, sem acentos (seção 36). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Garante unicidade contra um conjunto existente. */
export function uniqueSlug(base: string, existing: Set<string>): string {
  const slug = slugify(base);
  if (!existing.has(slug)) return slug;
  let i = 2;
  while (existing.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
