import { useState, useEffect } from 'react';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  visibility: 'Public' | 'Private';
  tagIds: string[];
}

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  availableTags: EventTag[];
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (values: EventFormValues) => void;
  onCancel?: () => void;
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DEFAULTS: EventFormValues = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
  capacity: 50,
  visibility: 'Public',
  tagIds: [],
};

export function EventForm({
  initialValues,
  availableTags,
  loading = false,
  submitLabel = 'Create & publish',
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>({
    ...DEFAULTS,
    ...initialValues,
    startsAt: toDatetimeLocal(initialValues?.startsAt || ''),
    endsAt: toDatetimeLocal(initialValues?.endsAt || ''),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        ...DEFAULTS,
        ...initialValues,
        startsAt: toDatetimeLocal(initialValues.startsAt || ''),
        endsAt: toDatetimeLocal(initialValues.endsAt || ''),
      });
    }
  }, [initialValues?.title]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!values.title.trim()) errs.title = 'Title is required.';
    if (values.title.length > 200) errs.title = 'Title must be 200 characters or fewer.';
    if (!values.startsAt) errs.startsAt = 'Start date is required.';
    if (!values.endsAt) errs.endsAt = 'End date is required.';
    if (values.startsAt && values.endsAt && new Date(values.endsAt) <= new Date(values.startsAt)) {
      errs.endsAt = 'End must be after start.';
    }
    if (values.capacity < 1) errs.capacity = 'Capacity must be at least 1.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...values,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
      });
    }
  };

  const update = (field: keyof EventFormValues, value: string | number | string[]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleTag = (tagId: string) => {
    const next = values.tagIds.includes(tagId)
      ? values.tagIds.filter((id) => id !== tagId)
      : [...values.tagIds, tagId];
    update('tagIds', next);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid clipboard-lines">
        <div className={`field field--lined${errors.title ? ' field--error' : ''}`}>
          <div className="field__top">
            <label className="field__label" htmlFor="f-title">Title <span className="req">*</span></label>
            <span className="field__count">{values.title.length} / 200</span>
          </div>
          <input
            id="f-title"
            className="input"
            type="text"
            maxLength={200}
            required
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="field__error">{errors.title}</p>}
          <p className="field__hint">Give it a name people will remember.</p>
        </div>

        <div className="field field--lined">
          <div className="field__top">
            <label className="field__label" htmlFor="f-desc">Description</label>
            <span className="field__count">{values.description.length} / 2000</span>
          </div>
          <textarea
            id="f-desc"
            className="textarea"
            maxLength={2000}
            rows={5}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="field field--lined">
          <div className="field__top">
            <label className="field__label" htmlFor="f-loc">Location</label>
            <span className="field__count">{values.location.length} / 300</span>
          </div>
          <input
            id="f-loc"
            className="input"
            type="text"
            maxLength={300}
            value={values.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className={`field${errors.startsAt ? ' field--error' : ''}`}>
            <label className="field__label" htmlFor="f-start">Start <span className="req">*</span></label>
            <input
              id="f-start"
              className="input input--datetime"
              type="datetime-local"
              required
              value={values.startsAt}
              onChange={(e) => update('startsAt', e.target.value)}
              aria-invalid={!!errors.startsAt}
            />
            {errors.startsAt && <p className="field__error">{errors.startsAt}</p>}
          </div>
          <div className={`field${errors.endsAt ? ' field--error' : ''}`}>
            <label className="field__label" htmlFor="f-end">End <span className="req">*</span></label>
            <input
              id="f-end"
              className="input input--datetime"
              type="datetime-local"
              required
              value={values.endsAt}
              onChange={(e) => update('endsAt', e.target.value)}
              aria-invalid={!!errors.endsAt}
            />
            {errors.endsAt && <p className="field__error">{errors.endsAt}</p>}
          </div>
          <div className={`field${errors.capacity ? ' field--error' : ''}`}>
            <label className="field__label" htmlFor="f-capacity">Capacity <span className="req">*</span></label>
            <input
              id="f-capacity"
              className="input"
              type="number"
              min={1}
              step={1}
              required
              value={values.capacity}
              onChange={(e) => update('capacity', parseInt(e.target.value, 10) || 1)}
              aria-invalid={!!errors.capacity}
            />
            {errors.capacity && <p className="field__error">{errors.capacity}</p>}
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
                onChange={() => update('visibility', 'Public')}
              />
              <span className="check__box" />
              <span className="check__label">Public</span>
            </label>
            <label className="check check--radio">
              <input
                type="radio"
                name="visibility"
                value="Private"
                checked={values.visibility === 'Private'}
                onChange={() => update('visibility', 'Private')}
              />
              <span className="check__box" />
              <span className="check__label">Private</span>
            </label>
          </div>
          <p className="field__hint">Public shows on the events table.</p>
        </fieldset>

        {availableTags.length > 0 && (
          <div className="field field--lined">
            <span className="field__label">Tags</span>
            <div className="chip-select">
              <div className="chip-select__list" role="listbox" aria-label="Select tags">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`chip-option${values.tagIds.includes(tag.id) ? ' is-selected' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                    role="option"
                    aria-selected={values.tagIds.includes(tag.id)}
                  >
                    <span className="tag-chip__dot" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="field__hint">Stick a few labels on so people can find it.</p>
          </div>
        )}

        <div className="form-footer">
          {onCancel && (
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
