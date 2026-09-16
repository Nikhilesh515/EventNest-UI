import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { tagStyleVars } from '../lib/tag-style';
import { useColorMode } from '../lib/theme-store';

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

export type EventFormMode = 'draft' | 'publish';

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  availableTags: EventTag[];
  loading?: boolean;
  canCreateTag?: boolean;
  onSubmit: (values: EventFormValues, mode: EventFormMode) => void;
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

const HEX_PATTERN = /^#?[0-9a-fA-F]{6}$|^#?[0-9a-fA-F]{3}$/;

export function EventForm({
  initialValues,
  availableTags,
  loading = false,
  canCreateTag = false,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const queryClient = useQueryClient();
  const mode = useColorMode();
  const [values, setValues] = useState<EventFormValues>({
    ...DEFAULTS,
    ...initialValues,
    startsAt: toDatetimeLocal(initialValues?.startsAt || ''),
    endsAt: toDatetimeLocal(initialValues?.endsAt || ''),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');
  const [newTagError, setNewTagError] = useState('');
  const tagWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tagOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (tagWrapRef.current && !tagWrapRef.current.contains(e.target as Node)) setTagOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTagOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [tagOpen]);

  const createTagMutation = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      api.post<{ result: EventTag }>('/api/tags', { name, color }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      const created = data?.result;
      if (created?.id) {
        setValues((prev) => ({ ...prev, tagIds: [...prev.tagIds, created.id] }));
      }
      setTagDialogOpen(false);
      setNewTagName('');
      setNewTagColor('#6366F1');
      setNewTagError('');
    },
    onError: (err) => {
      setNewTagError(err instanceof Error ? err.message : 'Could not create the tag.');
    },
  });

  const selectedTags = availableTags.filter((tag) => values.tagIds.includes(tag.id));
  const allTags = availableTags;

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
    setShowSummary(Object.keys(errs).length > 0);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const mode: EventFormMode = submitter?.value === 'draft' ? 'draft' : 'publish';
    onSubmit(
      {
        ...values,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
      },
      mode,
    );
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

  const handleCreateTag = () => {
    const name = newTagName.trim();
    const color = newTagColor.trim();
    if (!name) {
      setNewTagError('Give the tag a name.');
      return;
    }
    if (!HEX_PATTERN.test(color)) {
      setNewTagError('Use a hex color like #FF6B6B.');
      return;
    }
    setNewTagError('');
    createTagMutation.mutate({ name, color: color.charAt(0) === '#' ? color : `#${color}` });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="clipboard-tabs" role="navigation" aria-label="Form sections">
        <a className="btn btn--ghost btn--sm" href="#cb-details">Details</a>
        <a className="btn btn--ghost btn--sm" href="#cb-when">When &amp; where</a>
        <a className="btn btn--ghost btn--sm" href="#cb-tags">Tags</a>
      </div>

      {showSummary && Object.keys(errors).length > 0 && (
        <div className="error-summary" role="alert">
          <p className="error-summary__title">Please fix the following:</p>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#f-${field === 'startsAt' ? 'start' : field === 'endsAt' ? 'end' : field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-grid clipboard-lines">
        <div className={`field field--lined${errors.title ? ' field--error' : ''}`} id="cb-details">
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

        <div className="field field--lined" id="cb-when">
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
            <p className="field__hint">0 means no cap.</p>
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

        <div className="field field--lined" id="cb-tags">
          <div className="field__top">
            <span className="field__label" id="tags-label">Tags</span>
            {canCreateTag && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setTagDialogOpen(true)}
              >
                <Icon name="plus" size={16} /> Create tag
              </button>
            )}
          </div>
          <div className="chip-select" ref={tagWrapRef}>
            <div
              className="chip-select__trigger"
              role="button"
              tabIndex={0}
              aria-haspopup="listbox"
              aria-expanded={tagOpen}
              aria-labelledby="tags-label"
              onClick={() => setTagOpen((open) => !open)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTagOpen((open) => !open);
                }
              }}
            >
              {selectedTags.length === 0 ? (
                <span className="chip-select__placeholder">
                  <Icon name="plus" size={16} /> Add tag
                </span>
              ) : (
                selectedTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="tag-chip tag-chip--md tag-chip--remove"
                    style={tagStyleVars(tag.color, mode)}
                    title={tag.name}
                    aria-label={`Remove ${tag.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTag(tag.id);
                    }}
                  >
                    <span className="tag-chip__dot" aria-hidden="true" />
                    <span className="tag-chip__label">{tag.name}</span>
                    <span className="tag-chip__x" aria-hidden="true"><Icon name="x" size={12} /></span>
                  </button>
                ))
              )}
              <span style={{ marginInlineStart: 'auto', display: 'inline-flex' }}>
                <Icon name="chevron-down" size={16} />
              </span>
            </div>
            {tagOpen && (
              <div className="chip-select__list" role="listbox" aria-label="Select tags">
                {allTags.map((tag) => {
                  const selected = values.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className="chip-option"
                      onClick={() => toggleTag(tag.id)}
                    >
                      <span
                        className="tag-chip__dot"
                        aria-hidden="true"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {selected && <Icon name="check" size={16} className="chip-option__check" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="field__hint">Stick a few labels on so people can find it.</p>
        </div>

        <div className="form-footer">
          {onCancel && (
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" name="action" value="draft" className="btn btn--secondary" disabled={loading}>
            {loading ? 'Saving…' : 'Save as draft'}
          </button>
          <button type="submit" name="action" value="publish" className="btn btn--primary" disabled={loading}>
            <Icon name="check" size={18} /> Create &amp; publish
          </button>
        </div>
      </div>

      <Modal
        open={tagDialogOpen}
        title="Create a tag"
        onClose={() => setTagDialogOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleCreateTag}
              disabled={createTagMutation.isPending}
            >
              {createTagMutation.isPending ? 'Adding…' : 'Add tag'}
            </button>
          </>
        }
      >
        <div className="tag-create">
          <div className="field">
            <label className="field__label" htmlFor="nt-name">Name</label>
            <input
              id="nt-name"
              className="input"
              type="text"
              maxLength={40}
              placeholder="Ceramics"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="nt-color">Color</label>
            <div className="color-row">
              <input
                id="nt-color"
                className="input"
                type="text"
                maxLength={7}
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
              />
              <span className="color-preview" aria-hidden="true" style={{ background: newTagColor }} />
            </div>
            <p className="field__hint">Use a hex color like #FF6B6B.</p>
            {newTagError && <p className="field__error" role="alert">{newTagError}</p>}
          </div>
        </div>
      </Modal>
    </form>
  );
}
