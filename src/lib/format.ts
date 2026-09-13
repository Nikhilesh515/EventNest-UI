const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_UP = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function fmtTime(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h %= 12
  if (h === 0) h = 12
  return `${h}:${pad(m)} ${ap}`
}

export function fmtRange(start: string, end: string): string {
  const a = new Date(start)
  const b = new Date(end)
  if (a.toDateString() === b.toDateString()) return `${fmtTime(start)}–${fmtTime(end)}`
  return `${fmtDateShort(start)} – ${fmtDateShort(end)}`
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`
}

export function dateFlag(iso: string): { md: string; dow: string; day: number; mon: string } {
  const d = new Date(iso)
  return {
    md: `${MONTHS_UP[d.getMonth()]} ${d.getDate()}`,
    dow: DOW[d.getDay()] ?? '',
    day: d.getDate(),
    mon: MONTHS_UP[d.getMonth()] ?? '',
  }
}

export function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

export function isFuture(iso: string): boolean {
  return new Date(iso).getTime() > Date.now()
}

export function plural(n: number, singular: string, pluralForm?: string): string {
  return `${n} ${n === 1 ? singular : (pluralForm ?? `${singular}s`)}`
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function toIso(localDateTime: string): string {
  const parsed = new Date(localDateTime)
  return Number.isNaN(parsed.getTime()) ? localDateTime : parsed.toISOString()
}

export function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
