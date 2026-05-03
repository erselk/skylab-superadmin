import { z } from 'zod';

function normalizeLinkedinInput(input: unknown): string {
  if (input === '' || input === undefined || input === null) return '';
  const raw = String(input).trim().replace(/^@+/, '');
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) return raw;

  const n = raw.replace(/^\/?/, '');
  if (/^linkedin\.com\//i.test(n)) return `https://www.${n}`;
  if (/^www\.linkedin\.com\//i.test(n)) return `https://${n}`;
  return `https://www.linkedin.com/${n}`;
}

/** Kullanıcı genelde https yazmaz; `linkedin.com/in/...` vb. normalize edilir. Boş izinli. */
export const zOptionalLinkedInUrl = z.preprocess(
  normalizeLinkedinInput,
  z.union([z.literal(''), z.string().url({ message: 'Geçerli bir LinkedIn bağlantısı girin.' })]),
);
