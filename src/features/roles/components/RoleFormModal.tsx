import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { EffectivePermission, PermissionToggleSpec, RoleDto } from '@/types'
import { ALL_PERMISSIONS } from '@/lib/permissions'
import { Modal } from '@/components/overlays/Modal'
import { TextField } from '@/components/forms/TextField'
import { TextArea } from '@/components/forms/TextArea'
import { NumberField } from '@/components/forms/NumberField'
import { ErrorSummary } from '@/components/forms/ErrorSummary'
import { PermissionLedger } from '@/features/permissions/components/PermissionLedger'
import { AppApiError } from '@/api/errors'

interface RoleFormInput {
  name: string
  displayName: string
  description: string | null
  sortOrder: number
  permissionNames: string[]
}

interface RoleFormModalProps {
  open: boolean
  role?: RoleDto | null
  onClose(): void
  onSubmit(input: RoleFormInput): Promise<void>
}

export function RoleFormModal({ open, role, onClose, onSubmit }: RoleFormModalProps) {
  const [name, setName] = useState(role?.name ?? '')
  const [displayName, setDisplayName] = useState(role?.displayName ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [sortOrder, setSortOrder] = useState(role?.sortOrder ?? 0)
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissionNames ?? []))
  const [formErrors, setFormErrors] = useState<{ fieldId: string; message: string }[]>([])
  const [nameError, setNameError] = useState<string | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setName(role?.name ?? '')
      setDisplayName(role?.displayName ?? '')
      setDescription(role?.description ?? '')
      setSortOrder(role?.sortOrder ?? 0)
      setSelected(new Set(role?.permissionNames ?? []))
      setFormErrors([])
      setNameError(null)
      setDisplayNameError(null)
      setBanner(null)
    }
  }, [open, role])

  const permissions: EffectivePermission[] = useMemo(
    () =>
      ALL_PERMISSIONS.map((key) => ({
        key,
        roleHas: selected.has(key),
        effective: selected.has(key),
        source: selected.has(key) ? 'role default' : '-',
        expiry: null,
        overridden: false,
      })),
    [selected],
  )

  const toggle: PermissionToggleSpec = {
    isChecked: (key) => selected.has(key),
    setChecked: (key, checked) =>
      setSelected((previous) => {
        const next = new Set(previous)
        if (checked) next.add(key)
        else next.delete(key)
        return next
      }),
    disabled: busy,
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setBanner(null)
    setNameError(null)
    setDisplayNameError(null)
    setFormErrors([])

    try {
      await onSubmit({
        name: name.trim(),
        displayName: displayName.trim(),
        description: description.trim() ? description.trim() : null,
        sortOrder,
        permissionNames: [...selected].sort(),
      })
      onClose()
    } catch (caught) {
      if (caught instanceof AppApiError) {
        const fieldErrors = caught.fieldErrors
        if (fieldErrors.name) setNameError(fieldErrors.name)
        if (fieldErrors.displayName) setDisplayNameError(fieldErrors.displayName)
        const summary = Object.entries(fieldErrors).map(([field, message]) => ({
          fieldId: `role-${field}`,
          message,
        }))
        if (summary.length > 0) {
          setFormErrors(summary)
        } else {
          setBanner(caught.message)
        }
      } else {
        setBanner('Could not save the role.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title={role ? 'Edit role' : 'Create role'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="role-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving.' : 'Save role'}
          </button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} noValidate>
        {banner ? (
          <p className="banner banner--error" role="alert">
            {banner}
          </p>
        ) : null}
        <ErrorSummary errors={formErrors} />
        <div className="form-grid">
          <TextField
            id="role-name"
            label="Name"
            value={name}
            maxLength={50}
            required
            disabled={Boolean(role)}
            hint={role ? 'Role names cannot be changed.' : 'Used by the API, e.g. TagManager.'}
            error={nameError ?? undefined}
            onChange={(event) => {
              setName(event.target.value)
              if (nameError) setNameError(null)
            }}
          />
          <TextField
            id="role-displayName"
            label="Display name"
            value={displayName}
            maxLength={100}
            required
            error={displayNameError ?? undefined}
            onChange={(event) => {
              setDisplayName(event.target.value)
              if (displayNameError) setDisplayNameError(null)
            }}
          />
          <NumberField
            id="role-sortOrder"
            label="Sort order"
            value={sortOrder}
            min={0}
            onChange={setSortOrder}
          />
        </div>
        <TextArea
          id="role-description"
          label="Description"
          value={description}
          maxLength={300}
          showCounter
          rows={2}
          onChange={setDescription}
        />
        <div className="stack-3">
          <p className="muted">Permissions</p>
          <PermissionLedger
            permissions={permissions}
            userName={role?.displayName ?? 'this role'}
            busyKey={null}
            toggle={toggle}
          />
        </div>
      </form>
    </Modal>
  )
}
