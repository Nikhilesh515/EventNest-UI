import { useState } from 'react'
import type { FormEvent } from 'react'

import { Modal } from '@/components/overlays/Modal'
import { AppApiError } from '@/api/errors'

interface TagQuickCreateModalProps {
  open: boolean
  onClose(): void
  onCreate(input: { name: string; color: string }): Promise<void>
}

const HEX_RE = /^#?[0-9a-fA-F]{6}$/
const HEX_SHORT_RE = /^#?[0-9a-fA-F]{3}$/

export function TagQuickCreateModal({ open, onClose, onCreate }: TagQuickCreateModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366F1')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    const hex = color.trim()
    if (!trimmed) {
      setError('Give the tag a name.')
      return
    }
    if (!HEX_RE.test(hex) && !HEX_SHORT_RE.test(hex)) {
      setError('Use a hex color like #FF6B6B.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onCreate({ name: trimmed, color: hex.charAt(0) === '#' ? hex : `#${hex}` })
      setName('')
      setColor('#6366F1')
      onClose()
    } catch (caught) {
      setError(caught instanceof AppApiError ? caught.message : 'Could not create the tag.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Create a tag"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="tag-quick-create" className="btn btn--primary" disabled={busy}>
            {busy ? 'Creating…' : 'Add tag'}
          </button>
        </>
      }
    >
      <form id="tag-quick-create" onSubmit={handleSubmit} noValidate>
        <div className="tag-create">
          <div className="field">
            <label className="field__label" htmlFor="nt-name">
              Name
            </label>
            <input
              id="nt-name"
              className="input"
              type="text"
              maxLength={40}
              placeholder="Ceramics"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="nt-color">
              Color
            </label>
            <div className="color-row">
              <input
                id="nt-color"
                className="input"
                type="text"
                maxLength={7}
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
              <span
                className="color-preview"
                id="nt-preview"
                aria-hidden="true"
                style={{ background: color }}
              />
            </div>
            <p className="field__hint">Use a hex color like #FF6B6B.</p>
          </div>
          {error ? (
            <p className="field__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  )
}
