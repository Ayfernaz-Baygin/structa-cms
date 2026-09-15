const TURKISH_CHAR_MAP: Record<string, string> = {
  ğ: 'g',
  ü: 'u',
  ş: 's',
  ı: 'i',
  ö: 'o',
  ç: 'c',
  Ğ: 'g',
  Ü: 'u',
  Ş: 's',
  İ: 'i',
  Ö: 'o',
  Ç: 'c',
};

export function slugify(value: string): string {
  const normalized = value.replace(/[ğüşıöçĞÜŞİÖÇ]/g, (char) => TURKISH_CHAR_MAP[char] ?? char);

  return normalized
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
