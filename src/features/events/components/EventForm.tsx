import { useEffect, useState } from 'react'

import { AppApiError } from '@/api/errors'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Icon } from '@/components/icons/Icon'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { TagPicker } from '@/features/tags/components/TagPicker'
import { cn } from '@/lib/cn'
import { toIso, toLocalInputValue } from '@/lib/format'
import { validateEvent } from '@/lib/validation'
import type { FieldErrors } from '@/lib/validation'
import type { CreateEventRequest, EventDto, TagDto } from '@/types'
import { EventStatusStrip } from './EventStatusStrip'
import type { FormNotice } from './EventStatusStrip'

interface EventFormValues {
  title: string
  description: string
  location: string
  start: string
  end: string
  capacity: number
  visibility: 'Public' | 'Private'
  tagIds: string[]
}

interface EventFormProps {
  initial?: EventDto
  tags: TagDto[]
  tagsLoading?: boolean
  canCreateTag: boolean
  submitting?: boolean
  onQuickCreateTag(): void
  onCancel(): void
  onSubmit(values: CreateEventRequest, publish: boolean): Promise<void>
  onNotify?(notice: FormNotice): void
}

const FIELD_IDS: Record<string, string> = {
  title: 'f-title',
  description: 'f-desc',
  location: 'f-loc',
  start: 'f-start',
  end: 'f-end',
  capacity: 'f-capacity',
}

export function EventForm({
  initial,
  tags,
  tagsLoading,
  canCreateTag,
  submitting,
  onQuickCreateTag,
  onCancel,
  onSubmit,
  onNotify,
}: EventFormProps) {
  const isEdit = Boolean(initial)
  const [values, setValues] = useState<EventFormValues>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    location: initial?.location ?? '',
    start: initial ? toLocalInputValue(initial.start) : '',
    end: initial ? toLocalInputValue(initial.end) : '',
    capacity: initial?.capacity ?? 50,
    visibility: initial?.visibility ?? 'Public',
    tagIds: initial?.tags.map((tag) => tag.id) ?? [],
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [summary, setSummary] = useState<{ fieldId: string; message: string }[]>([])
  const [banner, setBanner] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pending, setPending] = useState<null | 'draft' | 'publish'>(null)
  const [discardOpen, setDiscardOpen] = useState(false)

  const busy = Boolean(submitting) || pending !== null

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  function set<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setDirty(true)
    setValues((current) => ({ ...current, [key]: value }))
  }

  function buildRequest(): CreateEventRequest {
    return {
      title: values.title,
      description: values.description,
      location: values.location,
      start: toIso(values.start),
      end: toIso(values.end),
      capacity: values.capacity,
      visibility: values.visibility,
      tagIds: values.tagIds,
      tagNames: Object.fromEntries(
        tags.filter((tag) => values.tagIds.includes(tag.id)).map((tag) => [tag.id, tag.name]),
      ),
    }
  }

  async function submit(publish: boolean) {
    if (busy) return
    const request = buildRequest()
    const nextErrors = validateEvent(request)
    setErrors(nextErrors)
    setBanner(null)
    if (Object.keys(nextErrors).length > 0) {
      setSummary(
        Object.entries(nextErrors).map(([field, message]) => ({
          fieldId: FIELD_IDS[field] ?? field,
          message,
        })),
      )
      const first = FIELD_IDS[Object.keys(nextErrors)[0] ?? ''] ?? ''
      document.getElementById(first)?.focus()
      return
    }
    setSummary([])
    setPending(publish ? 'publish' : 'draft')
    try {
      await onSubmit(request, publish)
      setDirty(false)
    } catch (caught) {
      if (caught instanceof AppApiError) {
        setErrors(caught.fieldErrors)
        setBanner(caught.message)
      } else {
        setBanner("We couldn't save this. Try again.")
      }
    } finally {
      setPending(null)
    }
  }

  function handleCancel() {
    if (!dirty) {
      onCancel()
      return
    }
    setDiscardOpen(true)
  }

  const count = (value: string, max: number) => (
    <span className={cn('field__count', value.length >= max * 0.9 && 'is-near')}>
      {value.length} / {max}
    </span>
  )

  return (
    <div className="clipboard">
      <span className="clipboard__clip" aria-hidden="true" />
      <PageDoc
        tapeVariant="yamabuki"
        kanji="手帳"
        overline={isEdit ? 'MY EVENTS / EDIT EVENT · 手帳' : 'MY EVENTS / NEW EVENT · 手帳'}
        title={isEdit ? 'Edit event' : 'Create an event'}
        subtitle="Fill the card, then pick a sticker for the daruma."
      />
      <div className="clipboard-tabs" role="navigation" aria-label="Form sections">
        <a className="btn btn--ghost btn--sm" href="#cb-details">
          Details
        </a>
        <a className="btn btn--ghost btn--sm" href="#cb-when">
          When &amp; where
        </a>
        <a className="btn btn--ghost btn--sm" href="#cb-tags">
          Tags
        </a>
      </div>
      <div id="form-summary-slot">
        {banner ? (
          <div className="error-summary" role="alert">
            <p className="error-summary__title">We couldn&apos;t save it</p>
            <p>{banner}</p>
          </div>
        ) : null}
        {summary.length ? (
          <div className="error-summary" role="alert">
            <p className="error-summary__title">Hmm, check these {summary.length} things:</p>
            <ul>
              {summary.map((item) => (
                <li key={item.fieldId}>
                  <a
                    href={`#${item.fieldId}`}
                    onClick={(event) => {
                      event.preventDefault()
                      document.getElementById(item.fieldId)?.focus()
                    }}
                  >
                    {item.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <form
        id="create-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit(false)
        }}
      >
        <div className="form-grid clipboard-lines">
          <div className={cn('field', 'field--lined', errors.title && 'field--error')} id="cb-details">
            <div className="field__top">
              <label className="field__label" htmlFor="f-title">
                Title <span className="req" aria-hidden="true">*</span>
              </label>
              {count(values.title, 200)}
            </div>
            <input
              id="f-title"
              className="input"
              type="text"
              maxLength={200}
              required
              aria-describedby="f-title-hint"
              aria-invalid={Boolean(errors.title)}
              value={values.title}
              onChange={(event) => set('title', event.target.value)}
            />
            <p className="field__hint" id="f-title-hint">
              Give it a name people will remember.
            </p>
            {errors.title ? (
              <p className="field__error" role="alert">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className={cn('field', 'field--lined', errors.description && 'field--error')}>
            <div className="field__top">
              <label className="field__label" htmlFor="f-desc">
                Description
              </label>
              {count(values.description, 2000)}
            </div>
            <textarea
              id="f-desc"
              className="textarea"
              maxLength={2000}
              rows={5}
              aria-invalid={Boolean(errors.description)}
              value={values.description}
              onChange={(event) => set('description', event.target.value)}
            />
            {errors.description ? (
              <p className="field__error" role="alert">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div className={cn('field', 'field--lined', errors.location && 'field--error')} id="cb-when">
            <div className="field__top">
              <label className="field__label" htmlFor="f-loc">
                Location
              </label>
              {count(values.location, 300)}
            </div>
            <input
              id="f-loc"
              className="input"
              type="text"
              maxLength={300}
              aria-invalid={Boolean(errors.location)}
              value={values.location}
              onChange={(event) => set('location', event.target.value)}
            />
            {errors.location ? (
              <p className="field__error" role="alert">
                {errors.location}
              </p>
            ) : null}
          </div>

          <div className="form-row">
            <div className={cn('field', errors.start && 'field--error')}>
              <label className="field__label" htmlFor="f-start">
                Start <span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="f-start"
                className="input input--datetime"
                type="datetime-local"
                required
                aria-invalid={Boolean(errors.start)}
                value={values.start}
                onChange={(event) => set('start', event.target.value)}
              />
              {errors.start ? (
                <p className="field__error" role="alert">
                  {errors.start}
                </p>
              ) : null}
            </div>
            <div className={cn('field', errors.end && 'field--error')}>
              <label className="field__label" htmlFor="f-end">
                End <span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="f-end"
                className="input input--datetime"
                type="datetime-local"
                required
                aria-invalid={Boolean(errors.end)}
                value={values.end}
                onChange={(event) => set('end', event.target.value)}
              />
              {errors.end ? (
                <p className="field__error" role="alert">
                  {errors.end}
                </p>
              ) : null}
            </div>
            <div className={cn('field', errors.capacity && 'field--error')}>
              <label className="field__label" htmlFor="f-capacity">
                Capacity <span className="req" aria-hidden="true">*</span>
              </label>
              <input
                id="f-capacity"
                className="input"
                type="number"
                min={0}
                step={1}
                required
                aria-describedby="f-capacity-hint"
                aria-invalid={Boolean(errors.capacity)}
                value={values.capacity}
                onChange={(event) => set('capacity', Number(event.target.value))}
              />
              <p className="field__hint" id="f-capacity-hint">
                0 means no cap.
              </p>
              {errors.capacity ? (
                <p className="field__error" role="alert">
                  {errors.capacity}
                </p>
              ) : null}
            </div>
          </div>

          <fieldset className="field">
            <legend className="field__label">Visibility</legend>
            <div className="cluster-3">
              <label className="check check--radio">
                <input
                  type="radio"
                  name="visibility"
                  value="Public"
                  checked={values.visibility === 'Public'}
                  onChange={() => set('visibility', 'Public')}
                />
                <span className="check__box" aria-hidden="true" />
                <span className="check__label">Public</span>
              </label>
              <label className="check check--radio">
                <input
                  type="radio"
                  name="visibility"
                  value="Private"
                  checked={values.visibility === 'Private'}
                  onChange={() => set('visibility', 'Private')}
                />
                <span className="check__box" aria-hidden="true" />
                <span className="check__label">Private</span>
              </label>
            </div>
            <p className="field__hint">Public shows on the events table.</p>
          </fieldset>

          <div className="field field--lined" id="cb-tags">
            <div className="field__top">
              <span className="field__label" id="tags-label">
                Tags
              </span>
              {canCreateTag ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={onQuickCreateTag}
                >
                  <Icon name="plus" size={16} />
                  Create tag
                </button>
              ) : null}
            </div>
            <TagPicker
              tags={tags}
              selectedIds={values.tagIds}
              loading={tagsLoading}
              canCreate={canCreateTag}
              onChange={(ids) => set('tagIds', ids)}
              onCreateRequest={onQuickCreateTag}
            />
            <p className="field__hint">Stick a few labels on so people can find it.</p>
          </div>

          <div className="form-footer">
            <button type="button" className="btn btn--ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={busy}
              onClick={() => void submit(false)}
            >
              {pending === 'draft' ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => void submit(true)}
            >
              <Icon name="check" size={18} />
              {pending === 'publish' ? 'Publishing…' : 'Create & publish'}
            </button>
          </div>

          {isEdit && initial ? <EventStatusStrip event={initial} onNotify={onNotify} /> : null}
        </div>
      </form>

      <ConfirmDialog
        open={discardOpen}
        title="Discard this event?"
        body="Your changes won't be saved."
        confirmLabel="Discard"
        danger
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          setDirty(false)
          onCancel()
        }}
      />
    </div>
  )
}
