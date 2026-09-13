import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { TagDto } from '@/types'
import { Modal } from '@/components/overlays/Modal'
import { TextField } from '@/components/forms/TextField'
import { ColorField } from '@/components/forms/ColorField'
import { AppApiError } from '@/api/errors'

interface TagFormModalProps {
  open: boolean
  tag?: TagDto | null
  onClose(): void
  onSubmit(input: { name: string; color: string }): Promise<void>
}

export function TagFormModal({ open, tag, onClose, onSubmit }: TagFormModalProps) {
  const [name, setName] = useState(tag?.name ?? '')
  const [color, setColor] = useState(tag?.color ?? '#6366F1')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setName(tag?.name ?? '')
      setColor(tag?.color ?? '#6366F1')
      setError(null)
    }
  }, [open, tag])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSubmit({ name, color })
      onClose()
    } catch (caught) {
      setError(
        caught instanceof AppApiError
          ? (caught.fieldErrors.name ?? caught.message)
          : 'Could not save the tag.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title={tag ? 'Edit tag' : 'Create tag'}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="tag-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save tag'}
          </button>
        </>
      }
    >
      <form id="tag-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="banner banner--error" role="alert">
            {error}
          </p>
        ) : null}
        <TextField
          id="tag-name"
          label="Name"
          value={name}
          maxLength={100}
          required
          onChange={(event) => setName(event.target.value)}
        />
        <ColorField id="tag-color" label="Colour" value={color} onChange={setColor} />
      </form>
    </Modal>
  )
}
