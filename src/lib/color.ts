import type { StyleVars, TagColor } from '@/types'

export interface Rgb {
  r: number
  g: number
  b: number
}

export function parseHex(hex: string): Rgb | null {
  if (typeof hex !== 'string') return null
  let h = hex.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h, s, l }
}

function hue2rgb(p: number, q: number, t: number): number {
  let x = t
  if (x < 0) x += 1
  if (x > 1) x -= 1
  if (x < 1 / 6) return p + (q - p) * 6 * x
  if (x < 1 / 2) return q
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
  return p
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hn = (((h % 360) + 360) % 360) / 360
  let r: number
  let g: number
  let b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, hn + 1 / 3)
    g = hue2rgb(p, q, hn)
    b = hue2rgb(p, q, hn - 1 / 3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

function toHex(rgb: Rgb): string {
  return (
    '#' +
    [rgb.r, rgb.g, rgb.b]
      .map((v) => {
        const s = Math.max(0, Math.min(255, v)).toString(16)
        return s.length === 1 ? `0${s}` : s
      })
      .join('')
      .toUpperCase()
  )
}

function luminance(hex: string): number {
  const c = parseHex(hex) ?? { r: 0, g: 0, b: 0 }
  const a = [c.r, c.g, c.b].map((v) => {
    const n = v / 255
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * (a[0] ?? 0) + 0.7152 * (a[1] ?? 0) + 0.0722 * (a[2] ?? 0)
}

export function contrastHex(a: string, b: string): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const hi = Math.max(l1, l2)
  const lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const round1 = (x: number) => Math.round(x * 10) / 10

export function normalizeTag(hex: string, mode: 'light' | 'dark'): TagColor {
  const parsed = parseHex(hex) ?? parseHex('#6366F1')
  const base = parsed ?? { r: 99, g: 102, b: 241 }
  const hsl = rgbToHsl(base.r, base.g, base.b)
  const lp = clamp(hsl.l, 0.32, 0.72)
  const sp = clamp(hsl.s, 0.28, 0.78)
  const lift = mode === 'dark' ? 0.14 : 0.2
  const satScale = mode === 'dark' ? 0.55 : 0.62
  let lfill = Math.min(0.9, lp + lift)
  const sfill = sp * satScale
  const ground = mode === 'dark' ? '#262440' : '#FFF9F0'
  const darkInk = mode === 'dark' ? '#1B1B2F' : '#33312E'
  const lightInk = mode === 'dark' ? '#F3F0FA' : '#FFFDF8'
  let fill = toHex(hslToRgb(hsl.h, sfill, lfill))

  const inkFor = (f: string) => {
    const cd = contrastHex(darkInk, f)
    const cl = contrastHex(lightInk, f)
    return cd >= cl ? { ink: darkInk, c: cd } : { ink: lightInk, c: cl }
  }

  let chosen = inkFor(fill)
  let guard = 0
  while (chosen.c < 4.5 && guard < 30) {
    if (chosen.ink === darkInk) lfill = Math.min(0.94, lfill + 0.03)
    else lfill = Math.max(0.1, lfill - 0.03)
    fill = toHex(hslToRgb(hsl.h, sfill, lfill))
    chosen = inkFor(fill)
    guard += 1
  }

  const ink = chosen.ink
  const inkContrast = chosen.c
  let edgeL = Math.max(0.24, lfill - 0.22)
  const edgeS = Math.min(0.9, sfill + 0.08)
  let edge = toHex(hslToRgb(hsl.h, edgeS, edgeL))
  let edgeGuard = 0
  while (contrastHex(edge, ground) < 3 && edgeL > 0.16 && edgeGuard < 20) {
    edgeL = Math.max(0.14, edgeL - 0.03)
    edge = toHex(hslToRgb(hsl.h, edgeS, edgeL))
    edgeGuard += 1
  }

  return {
    fill,
    ink,
    edge,
    inkContrast: round1(inkContrast),
    fillVsGround: round1(contrastHex(fill, ground)),
    edgeVsGround: round1(contrastHex(edge, ground)),
    aa: inkContrast >= 4.5,
    usedFallback: parseHex(hex) === null,
  }
}

export function tagStyleVars(color: TagColor, tilt?: number): StyleVars {
  return {
    '--tag-fill': color.fill,
    '--tag-ink': color.ink,
    '--tag-edge': color.edge,
    ...(tilt != null ? { '--sticker-tilt': `${tilt}deg` } : {}),
  }
}
