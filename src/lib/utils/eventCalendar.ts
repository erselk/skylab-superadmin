/**
 * Etkinlik başlangıç/bitiş tarihleri arasındaki yerel takvim günleri (bitiş dahil).
 */
export function getInclusiveLocalCalendarDates(startIso?: string, endIso?: string): Date[] {
  if (!startIso) return [];
  const endResolved = endIso || startIso;

  const start = parseIsoDateOnlyAnchor(startIso);
  const end = parseIsoDateOnlyAnchor(endResolved);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const out: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endKey = formatLocalDateKey(end);

  while (formatLocalDateKey(cur) <= endKey) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return out.length > 0 ? out : [];
}

function parseIsoDateOnlyAnchor(iso: string): Date {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return d;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
