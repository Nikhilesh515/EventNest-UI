import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { TagDto } from '@/types'
import { Modal } from '@/components/overlays/Modal'
import { TextField } from '@/components/forms/TextField'
import { ColorField } from '@/components/forms/ColorField'
import { AppApiError } from '@/api/errors'
import { parseHex } from '@/lib/color'

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
  const [nameError, setNameError] = useState<string | null>(null)
  const [colorError, setColorError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setName(tag?.name ?? '')
      setColor(tag?.color ?? '#6366F1')
      setError(null)
      setNameError(null)
      setColorError(null)
    }
  }, [open, tag])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parseHex(color)) {
      setColorError('Enter a valid hex colour, e.g. #6366F1.')
      return
    }
    setBusy(true)
    setError(null)
    setNameError(null)
    try {
      await onSubmit({ name, color })
      onClose()
    } catch (caught) {
      if (caught instanceof AppApiError && caught.fieldErrors.name) {
        setNameError(caught.fieldErrors.name)
      } else {
        setError(caught instanceof AppApiError ? caught.message : 'Could not save the tag.')
      }
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
          error={nameError ?? undefined}
          onChange={(event) => {
            setName(event.target.value)
            if (nameError) setNameError(null)
          }}
        />
        <ColorField
          id="tag-color"
          label="Colour"
          value={color}
          error={colorError ?? undefined}
          onChange={(value) => {
            setColor(value)
            if (colorError) setColorError(null)
          }}
        />
      </form>
    </Modal>
  )
}
