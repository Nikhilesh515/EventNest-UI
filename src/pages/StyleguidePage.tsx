import { useState } from 'react'
import type { ReactNode } from 'react'

import { useToast } from '@/app/providers/ToastProvider'
import { useTheme } from '@/app/providers/ThemeContext'
import { Mascot } from '@/components/brand/Mascot'
import { Wordmark } from '@/components/brand/Wordmark'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { CapacityMeter } from '@/components/data-display/CapacityMeter'
import { Hanko } from '@/components/data-display/Hanko'
import { MetaGrid } from '@/components/data-display/MetaGrid'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Pager } from '@/components/data-display/Pager'
import { PunchTable } from '@/components/data-display/PunchTable'
import { RsvpChip } from '@/components/data-display/RsvpChip'
import { StatCard } from '@/components/data-display/StatCard'
import { StatRow } from '@/components/data-display/StatRow'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { TagChip } from '@/components/data-display/TagChip'
import { VisibilityBadge } from '@/components/data-display/VisibilityBadge'
import { ColorField } from '@/components/forms/ColorField'
import { DateTimeField } from '@/components/forms/DateTimeField'
import { ErrorSummary } from '@/components/forms/ErrorSummary'
import { NumberField } from '@/components/forms/NumberField'
import { RadioGroup } from '@/components/forms/RadioGroup'
import { Select } from '@/components/forms/Select'
import { TextArea } from '@/components/forms/TextArea'
import { TextField } from '@/components/forms/TextField'
import { Icon } from '@/components/icons/Icon'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { Modal } from '@/components/overlays/Modal'
import { AccessDenied } from '@/components/states/AccessDenied'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { KoiLoader } from '@/components/states/KoiLoader'
import { MosaicSkeleton } from '@/components/states/MosaicSkeleton'
import { Skeleton } from '@/components/states/Skeleton'
import { SkeletonCard } from '@/components/states/SkeletonCard'
import { SkeletonRows } from '@/components/states/SkeletonRows'
import type { EventStatus, EventVisibility, IconName, RsvpStatus, TagDto } from '@/types'

const ICON_NAMES: IconName[] = [
  'calendar',
  'clock',
  'pin',
  'users',
  'user',
  'ticket',
  'tag',
  'search',
  'filter',
  'chevron-down',
  'chevron-right',
  'chevron-left',
  'x',
  'plus',
  'edit',
  'trash',
  'check',
  'question',
  'slash-circle',
  'star',
  'eye',
  'eye-off',
  'refresh',
  'menu',
  'moon-lantern',
]

const EVENT_STATUSES: EventStatus[] = ['Draft', 'Published', 'Cancelled', 'Completed']
const VISIBILITIES: EventVisibility[] = ['Public', 'Private']
const RSVP_STATUSES: RsvpStatus[] = ['Confirmed', 'Maybe', 'Declined', 'Cancelled']

const SAMPLE_TAG: TagDto = {
  id: 'sg-tag',
  name: 'Technology',
  color: '#3B82F6',
  createdAt: '2026-01-01T00:00:00Z',
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="page-doc" aria-labelledby={`sg-${id}`}>
      <h2 className="page-doc__title" id={`sg-${id}`}>
        {title}
      </h2>
      <div className="stack-4" style={{ marginTop: 'var(--space-4)' }}>
        {children}
      </div>
    </section>
  )
}

export default function StyleguidePage() {
  const { push } = useToast()
  const { theme, toggle } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [page, setPage] = useState(3)
  const [pageSize, setPageSize] = useState(9)
  const [text, setText] = useState('')
  const [area, setArea] = useState('')
  const [number, setNumber] = useState(10)
  const [date, setDate] = useState('')
  const [radio, setRadio] = useState('Public')
  const [select, setSelect] = useState('date-asc')
  const [color, setColor] = useState('#6366F1')

  return (
    <div className="stack-6" data-density="admin">
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'Styleguide' }]} />
      <PageDoc
        title="Styleguide"
        overline="Dev"
        subtitle="Every shared primitive, rendered against the frozen tokens."
        kanji="式"
        tapeVariant="shu"
        actions={
          <button type="button" className="btn btn--secondary" onClick={toggle}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        }
      />

      <Section id="brand" title="Brand & Mascots">
        <div className="cluster">
          <Wordmark size="md" withHanko />
          <Wordmark size="sm" />
        </div>
        <div className="mascot-row">
          {(['daruma', 'neko', 'koi', 'kokeshi'] as const).map((kind) => (
            <div className="mascot-cell" key={kind}>
              <div style={{ width: 96 }}>
                <Mascot kind={kind} />
              </div>
              <span className="pager-meta">{kind}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons">
        <div className="cluster">
          <button type="button" className="btn btn--primary">
            Primary
          </button>
          <button type="button" className="btn btn--secondary">
            Secondary
          </button>
          <button type="button" className="btn btn--danger">
            Danger
          </button>
          <button type="button" className="btn btn--primary" disabled>
            Disabled
          </button>
        </div>
      </Section>

      <Section id="badges" title="Badges & Chips">
        <div className="cluster">
          {EVENT_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
        <div className="cluster">
          {VISIBILITIES.map((visibility) => (
            <VisibilityBadge key={visibility} visibility={visibility} />
          ))}
        </div>
        <div className="cluster">
          {RSVP_STATUSES.map((status) => (
            <RsvpChip key={status} status={status} />
          ))}
          <RsvpChip status="none" />
        </div>
        <div className="cluster">
          <TagChip tag={SAMPLE_TAG} />
          <TagChip tag={SAMPLE_TAG} md />
          <TagChip tag={SAMPLE_TAG} interactive pressed />
        </div>
        <div className="cluster">
          <Hanko size="sm" />
          <Hanko />
          <Hanko size="lg" />
          <Hanko thumping />
        </div>
      </Section>

      <Section id="icons" title="Icons">
        <div className="cluster">
          {ICON_NAMES.map((name) => (
            <span className="mascot-cell" key={name} title={name}>
              <Icon name={name} size={22} />
              <span className="pager-meta">{name}</span>
            </span>
          ))}
        </div>
      </Section>

      <Section id="capacity" title="Capacity & Stats">
        <div className="stack-4">
          <CapacityMeter going={42} capacity={100} />
          <CapacityMeter going={82} capacity={100} />
          <CapacityMeter going={100} capacity={100} />
        </div>
        <StatRow>
          <StatCard label="Going" value={42} tone="going" sub="confirmed" />
          <StatCard label="Maybe" value={6} tone="maybe" />
          <StatCard label="Not going" value={3} tone="notgoing" />
          <StatCard label="Cancelled" value={1} tone="cancelled" />
          <StatCard label="Guests" value={58} tone="guests" />
          <StatCard label="Capacity" value={100} tone="capacity" />
        </StatRow>
        <MetaGrid
          rows={[
            { icon: 'clock', term: 'Start', detail: '2026-10-01 18:00' },
            { icon: 'pin', term: 'Location', detail: 'Kagurazaka Hall' },
            { icon: 'user', term: 'Organizer', detail: 'Mika' },
          ]}
        />
      </Section>

      <Section id="tables" title="Tables & Pager">
        <PunchTable
          caption="Sample guests"
          columns={[
            { key: 'name', header: 'Guest' },
            { key: 'status', header: 'Status' },
            { key: 'guests', header: 'Guests', numeric: true },
          ]}
        >
          <tr>
            <td>Yui</td>
            <td>Going</td>
            <td className="num">2</td>
          </tr>
          <tr>
            <td>Ren</td>
            <td>Maybe</td>
            <td className="num">1</td>
          </tr>
        </PunchTable>
        <Pager
          page={page}
          pages={9}
          total={81}
          pageSize={pageSize}
          sizeOptions={[9, 18, 36]}
          variant="sheet"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Section>

      <Section id="forms" title="Form controls">
        <ErrorSummary errors={[{ fieldId: 'sg-text', message: 'This is a sample field error.' }]} />
        <TextField
          id="sg-text"
          label="Text field"
          value={text}
          maxLength={120}
          showCounter
          leadingIcon="search"
          hint="With a leading icon and counter."
          onChange={(event) => setText(event.target.value)}
        />
        <TextArea
          id="sg-area"
          label="Text area"
          value={area}
          maxLength={280}
          showCounter
          onChange={setArea}
        />
        <div className="form-grid">
          <NumberField
            id="sg-number"
            label="Capacity"
            value={number}
            min={0}
            onChange={setNumber}
          />
          <DateTimeField id="sg-date" label="Starts" value={date} onChange={setDate} />
        </div>
        <RadioGroup
          name="sg-visibility"
          legend="Visibility"
          value={radio}
          options={[
            { value: 'Public', label: 'Public' },
            { value: 'Private', label: 'Private' },
          ]}
          onChange={setRadio}
        />
        <Select
          id="sg-sort"
          label="Sort"
          value={select}
          options={[
            { value: 'date-asc', label: 'Soonest first' },
            { value: 'date-desc', label: 'Latest first' },
          ]}
          onChange={setSelect}
        />
        <ColorField id="sg-color" label="Tag colour" value={color} onChange={setColor} />
      </Section>

      <Section id="skeletons" title="Skeletons">
        <div className="stack-4">
          <Skeleton variant="line" width="60%" />
          <Skeleton variant="chunk" />
          <SkeletonCard rows={3} />
          <SkeletonRows count={2} />
        </div>
        <MosaicSkeleton />
        <DetailSkeleton />
      </Section>

      <Section id="states" title="States">
        <EmptyState
          title="No events found."
          body="Try a different search, or clear the filters."
          cta={{
            label: 'Clear filters',
            onClick: () => push({ kind: 'info', title: 'Filters cleared.' }),
          }}
          kanji="空"
        />
        <ErrorState onRetry={() => push({ kind: 'error', title: 'Retried.' })} />
        <AccessDenied message="Sample access-denied state." />
        <KoiLoader label="Loading sample." />
        <div className="cluster">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => push({ kind: 'success', title: 'Saved.', body: 'A success toast.' })}
          >
            Success toast
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => push({ kind: 'info', title: 'Heads up.', body: 'An info toast.' })}
          >
            Info toast
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() =>
              push({ kind: 'error', title: 'Something failed.', body: 'An error toast.' })
            }
          >
            Error toast
          </button>
        </div>
      </Section>

      <Section id="overlays" title="Overlays">
        <div className="cluster">
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            Open modal
          </button>
          <button type="button" className="btn btn--danger" onClick={() => setConfirmOpen(true)}>
            Open confirm
          </button>
        </div>
        <Modal
          open={modalOpen}
          title="Sample modal"
          onClose={() => setModalOpen(false)}
          footer={
            <button type="button" className="btn btn--primary" onClick={() => setModalOpen(false)}>
              Done
            </button>
          }
        >
          <p>Modal body content rendered through the modal portal.</p>
        </Modal>
        <ConfirmDialog
          open={confirmOpen}
          title="Sample confirmation"
          body="This is a destructive action sample."
          confirmLabel="Confirm"
          danger
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
        />
      </Section>

      <Section id="errors" title="Error states">
        <ErrorState
          title="Permission management is not available yet."
          body="The gateway route /api/permissions/** has not shipped (BP-01)."
          mascot="kokeshi"
          secondary={{ label: 'Back to events', to: '/events' }}
        />
      </Section>
    </div>
  )
}
