import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { useToast } from '@/app/providers/ToastProvider'
import { useTheme } from '@/app/providers/ThemeContext'
import { Mascot } from '@/components/brand/Mascot'
import { CapacityMeter } from '@/components/data-display/CapacityMeter'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Pager } from '@/components/data-display/Pager'
import { RsvpChip } from '@/components/data-display/RsvpChip'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { TagChip } from '@/components/data-display/TagChip'
import { VisibilityBadge } from '@/components/data-display/VisibilityBadge'
import { ICON_PATHS } from '@/components/icons/iconRegistry'
import { Icon } from '@/components/icons/Icon'
import { Modal } from '@/components/overlays/Modal'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonCard } from '@/components/states/SkeletonCard'
import { RsvpStickerSheet } from '@/features/rsvps/components/RsvpStickerSheet'
import { useTags } from '@/features/tags/useTags'
import { normalizeTag } from '@/lib/color'
import { fmtDate } from '@/lib/format'
import { initialsOf } from '@/lib/format'
import type { EventStatus, EventVisibility, IconName, RsvpUiKey, RsvpStatus } from '@/types'

const RAMPS: [string, number[]][] = [
  ['cream', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['sumi', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['sakura', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['sora', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['wakatake', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['yamabuki', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['shu', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['matcha', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['fuji', [50, 100, 200, 300, 400, 500, 600, 700, 800]],
  ['indigo', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]],
]

const TYPE_SAMPLES: [string, string, string, string, number][] = [
  ['--type-display-xl', 'display-xl · 56', 'Find your next festival.', 'var(--font-display)', 400],
  ['--type-display-l', 'display-l · 44', 'Find your next festival.', 'var(--font-display)', 400],
  ['--type-display-m', 'display-m · 34', 'Page title desktop', 'var(--font-display)', 400],
  ['--type-display-s', 'display-s · 27', 'Page title mobile', 'var(--font-display)', 400],
  ['--type-h1', 'h1 · 32', 'A section heading', 'var(--font-round)', 700],
  ['--type-h2', 'h2 · 26', 'A smaller heading', 'var(--font-round)', 700],
  ['--type-h3', 'h3 · 21', 'Polaroid title', 'var(--font-round)', 700],
  ['--type-h4', 'h4 · 18', 'Sub-heading', 'var(--font-round)', 700],
  [
    '--type-body-l',
    'body-l · 18',
    'Lead paragraph with a bit more presence.',
    'var(--font-body)',
    500,
  ],
  [
    '--type-body',
    'body · 16',
    'The quick brown fox jumps over the lazy dog.',
    'var(--font-body)',
    400,
  ],
  ['--type-body-s', 'body-s · 14', 'Polaroid meta and secondary text.', 'var(--font-body)', 400],
  ['--type-caption', 'caption · 13', 'Helper text and captions.', 'var(--font-body)', 500],
  ['--type-label', 'label · 14', 'Form label', 'var(--font-round)', 700],
  ['--type-overline', 'overline · 12', 'ORGANIZER', 'var(--font-round)', 700],
  ['--type-badge', 'badge · 12', 'Published', 'var(--font-round)', 700],
  ['--type-mono-num', 'mono-num · 16', '1,283 going', 'var(--font-body)', 700],
]

const NORM_PRESETS = [
  '#3B82F6',
  '#EF4444',
  '#FDE047',
  '#000000',
  '#FFFFFF',
  '#808080',
  '#6366F1',
  '#invalid',
]

const COMPARE_ROWS: string[][] = [
  [
    'Shell',
    'Sticky top navbar (64px)',
    'Fixed left album rail (272px / 88px spine)',
    'Persistent index; cover-board identity',
  ],
  [
    'Navigation',
    'Horizontal links + admin dropdown',
    'Vertical index tabs with page numbers',
    'Orientation without scroll-to-top; stable numbering',
  ],
  [
    'Mobile nav',
    'Hamburger drawer',
    'Top bar + bottom album tab bar + index drawer',
    'Thumb reachability; persistent primary destinations',
  ],
  [
    'Canvas',
    'Full-width container under navbar',
    'Offset canvas right of rail with binding crease',
    'Reads as a right-hand page; spine metaphor',
  ],
  [
    'Home layout',
    '12-col uniform event grid',
    '6x6 polaroid mosaic (9 tiles + 4 fillers), fixed template',
    'Curated spread; mixed sizes encode importance',
  ],
  [
    'Tile sizes',
    'One card size',
    'feature 3x2, portrait 2x2, wide 2x1, mini 1x1',
    'Compositional hierarchy',
  ],
  [
    'Tile tilt',
    '+/-1.4 deg stagger only',
    'Per-slot tilt +/-2.2 deg, straightens on hover/focus',
    'Press the photo flat affordance',
  ],
  [
    'Mounting',
    'Card border only',
    'Photo corners + washi tape + caption plate',
    'Album-mount language',
  ],
  [
    'Filters',
    'Sticky filter bar',
    'Sticker-sheet drawer from rail / bottom sheet',
    'Filters are peeled, not left open',
  ],
  [
    'Detail',
    '8/4 main/side split',
    'Postcard + reply card with center seam',
    'Postcard you reply to',
  ],
  ['My Events', 'List rows', 'Notebook pages with spiral + punch rows', 'Back-counter notebook'],
  ['My RSVPs', 'Grouped rows', 'Stamp log with hanko stamps', 'Collectible log'],
  ['Attendees', 'Stats + punch table', 'Guestbook with portrait frames', 'Signed guestbook'],
  [
    'Forms/Admin',
    'Centered cards',
    'Clipboard / ledger boards with tab dividers',
    'Quiet, dense, serious-but-cute',
  ],
  [
    'Login',
    'Split form + art panel',
    'Full album cover (rail hidden)',
    'The cover is the entrance',
  ],
  ['Pagination', 'Page numbers', 'Sheet pager (collage 9/18)', 'Spreads, not pages'],
  ['Route motion', 'Sticker-slap stagger', 'Page-turn (rotateY) + tape reveal', 'Turning the page'],
  [
    'Reading order',
    'Row-major grid',
    'Fixed template, explicit slot order, algorithm',
    'DOM order == visual order with mixed sizes',
  ],
  [
    'Theme key',
    'eventnest.kawaii.theme',
    'eventnest.kawaii.scrapbook.theme',
    'Shared origin, no collision',
  ],
]

const SECTIONS = [
  'Layout',
  'Colors',
  'Type',
  'Space',
  'Icons',
  'Mascots',
  'Patterns',
  'Components',
  'Status',
  'Tags',
  'Motion',
]
const sectionId = (name: string) => `sg-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`

const MASCOTS = ['daruma', 'neko', 'koi', 'kokeshi'] as const

const PATTERNS = [
  'pattern--chiyogami-hana',
  'pattern--chiyogami-asa',
  'pattern--polka-sakura',
  'pattern--polka-sora',
  'pattern--tatami',
  'pattern--asanoha',
]

const SPACE_STEPS = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32']
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
const ELEVATIONS = ['paper', 'lift', 'raised', 'modal', 'sticker']
const LAYOUT_TOKENS = [
  '--rail-w',
  '--rail-w-md',
  '--rail-tab-h',
  '--crease-w',
  '--mosaic-row-h',
  '--mosaic-gap',
  '--mosaic-rot-scale',
  '--tape-page-w',
  '--tabbar-h',
  '--z-rail',
  '--z-tile-hover',
  '--dur-tile-settle',
]

const EVENT_STATUSES: EventStatus[] = ['Draft', 'Published', 'Cancelled', 'Completed']
const VISIBILITIES: EventVisibility[] = ['Public', 'Private']
const RSVP_KEYS: RsvpUiKey[] = ['going', 'maybe', 'notgoing', 'cancelled']
const RSVP_STATUS_TO_KEY: Record<RsvpStatus, RsvpUiKey> = {
  Confirmed: 'going',
  Maybe: 'maybe',
  Declined: 'notgoing',
  Cancelled: 'cancelled',
}

const DEMO_GUESTS = [
  {
    id: 'g1',
    name: 'Priya Nair',
    email: 'priya@example.com',
    key: 'going' as RsvpUiKey,
    status: 'Confirmed' as RsvpStatus,
    guests: 2,
    notes: 'Vegan meal, please',
    respondedAt: '2026-03-03T09:00:00Z',
  },
  {
    id: 'g2',
    name: 'Yuki Tanaka',
    email: 'yuki@example.com',
    key: 'going' as RsvpUiKey,
    status: 'Confirmed' as RsvpStatus,
    guests: 1,
    notes: '',
    respondedAt: '2026-03-02T07:30:00Z',
  },
  {
    id: 'g3',
    name: 'Lena Fischer',
    email: 'lena@example.com',
    key: 'going' as RsvpUiKey,
    status: 'Confirmed' as RsvpStatus,
    guests: 2,
    notes: 'Wheelchair access',
    respondedAt: '2026-02-26T11:15:00Z',
  },
]

function normalizePreview(hex: string, theme: 'light' | 'dark') {
  const n = normalizeTag(hex, theme)
  const raw = /^#?[0-9a-fA-F]{3,6}$/.test(hex)
    ? hex.charAt(0) === '#'
      ? hex
      : `#${hex}`
    : '#6366F1'
  return (
    <div className="norm-grid">
      <div className="norm-cell">
        <span className="norm-cell__label">Raw on cream (naive)</span>
        <span>
          <span className="raw-chip" style={{ background: raw, color: '#33312E' }}>
            {hex}
          </span>
        </span>
        <span className="norm-cell__label">The chip silhouette can vanish.</span>
      </div>
      <div className="norm-cell">
        <span className="norm-cell__label">Normalized sticker</span>
        <span>
          <span
            className="tag-chip tag-chip--md"
            style={
              {
                '--tag-fill': n.fill,
                '--tag-ink': n.ink,
                '--tag-edge': n.edge,
              } as CSSProperties
            }
          >
            <span className="tag-chip__dot" aria-hidden="true" />
            <span className="tag-chip__label">Sticker</span>
          </span>
        </span>
        <span className="contrast-readout">
          fill {n.fill} · ink {n.ink} · edge {n.edge}
        </span>
      </div>
      <div className="norm-cell">
        <span className="norm-cell__label">Contrast readout</span>
        <span className="contrast-readout">
          Ink contrast {n.inkContrast}:1 ·{' '}
          {n.aa ? (
            <span className="verdict-pass">Passes AA</span>
          ) : (
            <span className="verdict-fail">Fails AA</span>
          )}
        </span>
        <span className="contrast-readout">
          Fill vs ground {n.fillVsGround}:1 · Edge vs ground {n.edgeVsGround}:1
        </span>
        {n.usedFallback ? (
          <span className="norm-cell__label">Not a hex color — showing #6366F1</span>
        ) : null}
      </div>
    </div>
  )
}

export default function StyleguidePage() {
  const motionRefs = useRef<Record<string, HTMLElement | null>>({})
  const { push } = useToast()
  const { theme, toggle } = useTheme()
  const tags = useTags()
  const [modalOpen, setModalOpen] = useState(false)
  const [compare, setCompare] = useState(false)
  const [staticMascots, setStaticMascots] = useState(false)
  const [hex, setHex] = useState('#FDE047')
  const [page, setPage] = useState(2)
  const [pageSize, setPageSize] = useState(9)
  const [sticker, setSticker] = useState<RsvpUiKey | null>('going')

  const iconNames = Object.keys(ICON_PATHS) as IconName[]

  function replay(which: string) {
    const el = motionRefs.current[which]
    if (!el) return
    if (which === 'sticker') {
      el.classList.remove('is-pressing')
      void el.offsetWidth
      el.classList.add('is-pressing')
    } else if (which === 'hanko') {
      el.classList.remove('is-thumping')
      void el.offsetWidth
      el.classList.add('is-thumping')
    } else if (which === 'tile') {
      el.style.transition = 'none'
      el.style.transform = 'rotate(-6deg)'
      void el.offsetWidth
      el.style.transition = ''
      el.style.transform = ''
    } else if (which === 'page') {
      el.classList.remove('page-turn-in')
      void el.offsetWidth
      el.classList.add('page-turn-in')
    }
  }

  return (
    <div className={staticMascots ? 'sg-static' : undefined}>
      <PageDoc
        tapeVariant="shu"
        cornerTape="yamabuki"
        kanji="祭"
        overline="Living reference · 手帳 祭"
        title="Styleguide"
        subtitle="Every token, every component, every state. This page is the acceptance surface for the build."
        actions={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            data-theme-toggle
            aria-pressed={theme === 'dark'}
            aria-label="Switch to night stalls"
            onClick={toggle}
          >
            <Icon name="moon-lantern" size={18} />
            Toggle theme
          </button>
        }
      />

      <nav
        className="sg-nav"
        aria-label="Styleguide sections"
        style={{ marginTop: 'var(--space-6)' }}
      >
        {SECTIONS.map((name) => (
          <a key={name} className="btn btn--ghost btn--sm" href={`#${sectionId(name)}`}>
            {name}
          </a>
        ))}
      </nav>

      <section className="sg-section" id="sg-layout" style={{ marginTop: 'var(--space-8)' }}>
        <h2 className="sg-section__title">Layout comparison: classic vs Scrapbook Album</h2>
        <div className="sg-panel layout-compare">
          <p className="muted">
            Same paper, same palette, same stickers. The composition is the difference.
          </p>
          <div className="cluster">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              aria-pressed={compare}
              onClick={() => {
                const next = !compare
                setCompare(next)
                push({
                  kind: 'info',
                  title: next ? 'Scrapbook mosaic' : 'Classic grid',
                  body: 'The composition is the difference.',
                })
              }}
            >
              Toggle embedded demo
            </button>
            <span className="tertiary">New layout tokens are listed in spec §9 and §17.</span>
          </div>
          <div className="compare-demo">
            <div>
              <p className="sg-label">Classic — navbar + 12-col grid</p>
              <div className="shell-classic-demo">
                <div className="shell-classic-demo__bar">sticky navbar 64px</div>
                <div className="demo-classic">
                  {Array.from({ length: 11 }, (_, index) => (
                    <span key={index} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="sg-label">Scrapbook — rail + 6x6 mosaic</p>
              <div className="shell-scrapbook-demo">
                <div className="shell-scrapbook-demo__rail" />
                <div className="shell-scrapbook-demo__page">
                  right-hand page + crease
                  <div className="demo-scrapbook" style={{ marginTop: 8 }}>
                    <span className="d-feature" />
                    <span className="d-portrait" />
                    <span className="d-mini" />
                    <span className="d-mini" />
                    <span className="d-wide" />
                    <span className="d-wide" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <dl className="compare-table">
            {COMPARE_ROWS.map((row) => (
              <div className="compare-row" key={row[0]}>
                <dt>{row[0]}</dt>
                <dd>
                  <div className="compare-pair">
                    <span>
                      <strong>Classic:</strong> {row[1]}
                    </span>
                    <span>
                      <strong>Scrapbook:</strong> {row[2]}
                    </span>
                    <span className="tertiary">{row[3]}</span>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="sg-section" id="sg-colors">
        <h2 className="sg-section__title">Colors</h2>
        <div className="sg-panel">
          {RAMPS.map(([name, steps]) => (
            <div key={name} style={{ marginBottom: 'var(--space-4)' }}>
              <p className="sg-label">{name}</p>
              <div className="swatch-grid">
                {steps.map((step) => {
                  const token = `--${name}-${step}`
                  return (
                    <div className="swatch" key={step}>
                      <div className="swatch__color" style={{ background: `var(${token})` }} />
                      <div className="swatch__meta">
                        <strong>{step}</strong>
                        <span className="tok">{token}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sg-section" id="sg-type">
        <h2 className="sg-section__title">Type</h2>
        <div className="sg-panel">
          {TYPE_SAMPLES.map((sample) => (
            <div className="type-sample" key={sample[0]}>
              <span className="type-sample__meta">
                {sample[1]} · {sample[0]}
              </span>
              <p
                style={{
                  fontFamily: sample[3],
                  fontSize: `var(${sample[0]})`,
                  fontWeight: sample[4],
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {sample[2]}
              </p>
            </div>
          ))}
          <div className="type-sample">
            <span className="type-sample__meta">--type-kanji-xl/l/m · round 700</span>
            <p style={{ margin: 0 }}>
              <span
                style={{
                  fontSize: 'var(--type-kanji-xl)',
                  fontFamily: 'var(--font-round)',
                  fontWeight: 700,
                }}
              >
                祭
              </span>{' '}
              <span
                style={{
                  fontSize: 'var(--type-kanji-l)',
                  fontFamily: 'var(--font-round)',
                  fontWeight: 700,
                }}
              >
                福
              </span>{' '}
              <span
                style={{
                  fontSize: 'var(--type-kanji-m)',
                  fontFamily: 'var(--font-round)',
                  fontWeight: 700,
                }}
              >
                招
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-space">
        <h2 className="sg-section__title">Space, radii &amp; elevation</h2>
        <div className="sg-panel">
          <p className="sg-label">Spacing scale</p>
          <div className="cluster">
            {SPACE_STEPS.map((n) => (
              <span
                key={n}
                style={{
                  display: 'inline-grid',
                  placeItems: 'center',
                  background: 'var(--surface-tint-sky)',
                  border: '1px solid var(--border-soft)',
                  height: `var(--space-${n})`,
                  minWidth: `var(--space-${n})`,
                  fontSize: 10,
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <p className="sg-label">Radii</p>
          <div className="cluster">
            {RADII.map((r) => (
              <span
                key={r}
                style={{
                  display: 'inline-block',
                  width: 56,
                  height: 44,
                  background: 'var(--surface-sunken)',
                  border: '2px solid var(--border-soft)',
                  borderRadius: `var(--radius-${r})`,
                  textAlign: 'center',
                  fontSize: 10,
                  lineHeight: '40px',
                }}
              >
                {r}
              </span>
            ))}
          </div>
          <p className="sg-label">Elevation</p>
          <div className="cluster">
            {ELEVATIONS.map((e) => (
              <span
                key={e}
                style={{
                  display: 'inline-block',
                  padding: '12px 16px',
                  background: 'var(--surface-paper)',
                  border: '2px solid var(--border-soft)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: `var(--shadow-${e})`,
                }}
              >
                {e}
              </span>
            ))}
          </div>
          <p className="sg-label">New layout tokens</p>
          <div className="cluster">
            {LAYOUT_TOKENS.map((t) => (
              <span className="mock-badge" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-icons">
        <h2 className="sg-section__title">Icons</h2>
        <div className="sg-panel">
          <div className="icon-grid">
            {iconNames.map((name) => (
              <div className="icon-cell" key={name}>
                <Icon name={name} size={24} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-mascots">
        <h2 className="sg-section__title">Mascots</h2>
        <div className="sg-panel">
          <div className="cluster" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="check">
              <input
                type="checkbox"
                checked={!staticMascots}
                onChange={(event) => setStaticMascots(!event.target.checked)}
              />
              <span className="check__box" aria-hidden="true" />
              <span className="check__label">Idle animations</span>
            </label>
          </div>
          <div className="mascot-row">
            {MASCOTS.map((kind) => (
              <div className="mascot-cell" key={kind}>
                <div style={{ width: 140 }}>
                  <Mascot kind={kind} />
                </div>
                <span className="type-sample__meta">{kind}</span>
                <div className="size-pair">
                  <div style={{ width: 64 }}>
                    <Mascot kind={kind} />
                  </div>
                  <div style={{ width: 40 }}>
                    <Mascot kind={kind} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-patterns">
        <h2 className="sg-section__title">Patterns</h2>
        <div className="sg-panel">
          <div className="pattern-demo">
            {PATTERNS.map((pattern) => (
              <div key={pattern}>
                <div
                  className={`pattern-swatch ${pattern}`}
                  style={{ backgroundColor: 'var(--surface-page)' }}
                />
                <span className="sg-label">{pattern.replace('pattern--', '')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-components">
        <h2 className="sg-section__title">Components</h2>
        <div className="sg-panel sg-stack">
          <div>
            <p className="sg-label">Buttons</p>
            <div className="cluster">
              <button type="button" className="btn btn--primary">
                Primary
              </button>
              <button type="button" className="btn btn--secondary">
                Secondary
              </button>
              <button type="button" className="btn btn--ghost">
                Ghost
              </button>
              <button type="button" className="btn btn--danger">
                Danger
              </button>
              <button type="button" className="btn btn--sun">
                Sun
              </button>
              <button type="button" className="btn btn--leaf">
                Leaf
              </button>
              <button type="button" className="btn btn--primary" disabled>
                Disabled
              </button>
              <button type="button" className="btn btn--secondary btn--sm">
                Small
              </button>
              <button type="button" className="btn btn--primary btn--lg">
                Large
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--icon"
                aria-label="Icon button"
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
          </div>

          <div>
            <p className="sg-label">Inputs</p>
            <div className="form-row">
              <div className="field">
                <label className="field__label" htmlFor="sg-input">
                  Text input
                </label>
                <input id="sg-input" className="input" placeholder="Placeholder" />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="sg-input2">
                  Disabled
                </label>
                <input id="sg-input2" className="input" defaultValue="Cannot edit" disabled />
              </div>
              <div className="field field--error">
                <label className="field__label" htmlFor="sg-input3">
                  Error
                </label>
                <input
                  id="sg-input3"
                  className="input"
                  defaultValue="bad value"
                  aria-invalid="true"
                />
                <p className="field__error">That does not look right.</p>
              </div>
            </div>
            <div className="field" style={{ marginTop: 'var(--space-3)' }}>
              <label className="field__label" htmlFor="sg-ta">
                Textarea
              </label>
              <textarea id="sg-ta" className="textarea" placeholder="Say a little more…" />
            </div>
            <div className="field" style={{ marginTop: 'var(--space-3)' }}>
              <label className="field__label" htmlFor="sg-sel">
                Select
              </label>
              <select id="sg-sel" className="select" defaultValue="One">
                <option>One</option>
                <option>Two</option>
              </select>
            </div>
          </div>

          <div>
            <p className="sg-label">Checkbox &amp; radio</p>
            <div className="cluster">
              <label className="check">
                <input type="checkbox" defaultChecked />
                <span className="check__box" aria-hidden="true" />
                <span className="check__label">Checked box</span>
              </label>
              <label className="check check--radio">
                <input type="radio" name="sgr" defaultChecked />
                <span className="check__box" aria-hidden="true" />
                <span className="check__label">Selected radio</span>
              </label>
            </div>
          </div>

          <div>
            <p className="sg-label">Segmented control</p>
            <div className="seg" role="radiogroup" aria-label="Demo">
              <button type="button" className="seg__btn" role="radio" aria-checked="true">
                All
              </button>
              <button type="button" className="seg__btn" role="radio" aria-checked="false">
                Public
              </button>
              <button type="button" className="seg__btn" role="radio" aria-checked="false">
                Private
              </button>
            </div>
          </div>

          <div>
            <p className="sg-label">Tag stickers (incl. hostile #FDE047)</p>
            <div className="cluster">
              {(tags.data ?? []).map((tag) => (
                <TagChip key={tag.id} tag={tag} md />
              ))}
            </div>
          </div>

          <div>
            <p className="sg-label">Status &amp; visibility badges</p>
            <div className="cluster">
              {EVENT_STATUSES.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <div className="cluster" style={{ marginTop: 'var(--space-3)' }}>
              {(['going', 'maybe', 'notgoing', 'cancelled', 'none'] as const).map((key) => (
                <RsvpChip
                  key={key}
                  status={
                    key === 'none'
                      ? 'none'
                      : (Object.keys(RSVP_STATUS_TO_KEY).find(
                          (s) => RSVP_STATUS_TO_KEY[s as RsvpStatus] === key,
                        ) as RsvpStatus)
                  }
                />
              ))}
            </div>
            <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
              {VISIBILITIES.map((visibility) => (
                <VisibilityBadge key={visibility} visibility={visibility} />
              ))}
              <span className="badge badge--full">FULL</span>
            </div>
          </div>

          <div>
            <p className="sg-label">RSVP sticker sheet (static)</p>
            <div className="rsvp-card" style={{ maxWidth: 520 }}>
              <p className="rsvp-card__legend">Your RSVP</p>
              <RsvpStickerSheet value={sticker} onChange={setSticker} />
            </div>
          </div>

          <div>
            <p className="sg-label">Capacity meters (70% · 95% · full)</p>
            <div className="sg-stack" style={{ maxWidth: 420 }}>
              <CapacityMeter going={84} capacity={120} />
              <CapacityMeter going={19} capacity={20} />
              <CapacityMeter going={35} capacity={35} />
            </div>
          </div>

          <div>
            <p className="sg-label">Punch-card table</p>
            <div className="table-scroll">
              <table className="table-punch">
                <caption className="sr-only">Punch-card demo</caption>
                <thead>
                  <tr>
                    <th scope="col">Guest</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="num">
                      Guests
                    </th>
                    <th scope="col">Notes</th>
                    <th scope="col">Responded</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_GUESTS.map((guest) => (
                    <tr key={guest.id}>
                      <td data-label="Guest">
                        <div className="guestbook-table__guest">
                          <span className="guestbook-table__frame" aria-hidden="true">
                            {initialsOf(guest.name)}
                          </span>
                          <div className="table-punch__guest">
                            <span className="name">{guest.name}</span>
                            <span className="email">{guest.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Status">
                        <RsvpChip status={guest.status} />
                      </td>
                      <td data-label="Guests" className="num tnum">
                        {guest.guests}
                      </td>
                      <td data-label="Notes">
                        {guest.notes ? (
                          <button
                            type="button"
                            className="notes-btn"
                            aria-label={`Show full note from ${guest.name}`}
                          >
                            <span className="table-punch__notes">{guest.notes}</span>
                          </button>
                        ) : (
                          <span className="tertiary">—</span>
                        )}
                      </td>
                      <td data-label="Responded">
                        <time dateTime={guest.respondedAt}>{fmtDate(guest.respondedAt)}</time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="sg-label">Pagination</p>
            <Pager
              page={page}
              pages={5}
              total={42}
              pageSize={pageSize}
              sizeOptions={[9, 18]}
              variant="sheet"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>

          <div>
            <p className="sg-label">Skeleton</p>
            <div className="cluster">
              <SkeletonCard />
            </div>
          </div>

          <div>
            <p className="sg-label">Empty state (daruma)</p>
            <EmptyState
              title="The stall is quiet."
              body="No events match your filters."
              cta={{ label: 'Paint the other eye · Clear filters', onClick: () => undefined }}
            />
          </div>

          <div>
            <p className="sg-label">Error state (koi / kokeshi)</p>
            <ErrorState
              title="We couldn't load this."
              body="The stall didn't answer in time."
              onRetry={() => undefined}
              meta="Error code: 502"
            />
          </div>

          <div>
            <p className="sg-label">Toasts &amp; modal</p>
            <div className="cluster">
              <button
                type="button"
                className="btn btn--leaf btn--sm"
                onClick={() =>
                  push({ kind: 'success', title: 'Saved!', body: 'Your event is on the table.' })
                }
              >
                Success toast
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() =>
                  push({ kind: 'info', title: 'Saved!', body: 'Your event is on the table.' })
                }
              >
                Info toast
              </button>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() =>
                  push({
                    kind: 'error',
                    title: 'Something went wrong',
                    body: "The stall didn't answer in time.",
                  })
                }
              >
                Error toast
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setModalOpen(true)}
              >
                Open modal
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-status">
        <h2 className="sg-section__title">Status matrices</h2>
        <div className="sg-panel">
          <p className="sg-label">Event status</p>
          <div className="cluster">
            {EVENT_STATUSES.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
          <p className="sg-label">RSVP status</p>
          <div className="cluster">
            {RSVP_KEYS.map((key) => (
              <RsvpChip
                key={key}
                status={
                  Object.keys(RSVP_STATUS_TO_KEY).find(
                    (s) => RSVP_STATUS_TO_KEY[s as RsvpStatus] === key,
                  ) as RsvpStatus
                }
              />
            ))}
            <RsvpChip status="none" />
          </div>
          <p className="sg-label">Token trios</p>
          <div className="cluster">
            {[
              '--status-published-bg',
              '--status-draft-bg',
              '--status-cancelled-bg',
              '--status-completed-bg',
            ].map((token) => (
              <span
                key={token}
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-soft)',
                  background: `var(${token})`,
                  color: 'var(--text-primary)',
                  fontSize: 'var(--type-caption)',
                }}
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="sg-section" id="sg-tags">
        <h2 className="sg-section__title">Tag normalization</h2>
        <div className="sg-panel">
          <p className="muted">Sticker normalizer — enter any hex. We&apos;ll keep it legible.</p>
          <div className="cluster" style={{ marginBlock: 'var(--space-3)' }}>
            <label className="sr-only" htmlFor="sg-hex">
              Hex color
            </label>
            <input
              id="sg-hex"
              className="input select--inline"
              type="text"
              value={hex}
              maxLength={7}
              style={{ width: 140 }}
              onChange={(event) => setHex(event.target.value)}
            />
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setHex((current) => current.trim())}
            >
              Normalize
            </button>
            {NORM_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="tag-chip tag-chip--interactive"
                onClick={() => setHex(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
          <div id="sg-norm-result">{normalizePreview(hex, theme)}</div>
        </div>
      </section>

      <section className="sg-section" id="sg-motion">
        <h2 className="sg-section__title">Motion</h2>
        <div className="sg-panel">
          <div className="cluster" style={{ marginBottom: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => replay('sticker')}
            >
              Replay sticker press
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => replay('hanko')}
            >
              Replay hanko thump
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => replay('tile')}
            >
              Replay tile settle
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => replay('page')}
            >
              Replay page turn
            </button>
            <label className="check">
              <input
                type="checkbox"
                onChange={(event) =>
                  document.documentElement.classList.toggle('force-reduced', event.target.checked)
                }
              />
              <span className="check__box" aria-hidden="true" />
              <span className="check__label">Force reduced motion</span>
            </label>
          </div>
          <div className="motion-grid">
            <div className="motion-cell">
              <div
                className="rsvp-sticker rsvp-sticker--going"
                ref={(node) => {
                  motionRefs.current.sticker = node
                }}
              >
                <span className="rsvp-sticker__glyph" aria-hidden="true">
                  ✓
                </span>
                <span className="rsvp-sticker__label">Press</span>
              </div>
              <span className="type-sample__meta">sticker-press</span>
            </div>
            <div className="motion-cell">
              <div
                className="hanko hanko--lg"
                ref={(node) => {
                  motionRefs.current.hanko = node
                }}
              >
                福
              </div>
              <span className="type-sample__meta">hanko-thump</span>
            </div>
            <div className="motion-cell">
              <div
                className="tile__polaroid"
                style={{ width: 120, height: 90, '--tile-rot': '-2deg' } as CSSProperties}
                ref={(node) => {
                  motionRefs.current.tile = node
                }}
              >
                <div className="tile__caption">
                  <span className="tile__title">Tile</span>
                </div>
              </div>
              <span className="type-sample__meta">tile-settle</span>
            </div>
            <div className="motion-cell" style={{ width: '100%' }}>
              <div
                className="page-turn-in"
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--surface-paper)',
                  border: '2px solid var(--border-soft)',
                  borderRadius: 'var(--radius-md)',
                }}
                ref={(node) => {
                  motionRefs.current.page = node
                }}
              >
                Page turn
              </div>
              <span className="type-sample__meta">page-turn</span>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title="Confirm this action?"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setModalOpen(false)}>
              Confirm
            </button>
          </>
        }
      >
        <p>This is a paper modal with a washi tape top. Escape closes it.</p>
      </Modal>
    </div>
  )
}
