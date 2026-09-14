import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { useUserPermissions } from '@/features/permissions/useUserPermissions'
import { useUpdateUser } from '@/features/users/useUpdateUser'
import { FEATURES } from '@/lib/features'
import { ROLE_DEFAULTS, PERMISSION_GROUPS } from '@/lib/permissions'
import { PageDoc } from '@/components/data-display/PageDoc'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { MetaGrid } from '@/components/data-display/MetaGrid'
import { TextField } from '@/components/forms/TextField'
import { FormActions } from '@/components/forms/FormActions'
import { SkeletonCard } from '@/components/states/SkeletonCard'
import { ErrorState } from '@/components/states/ErrorState'
import { useToast } from '@/app/providers/ToastProvider'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const updateUser = useUpdateUser()
  const permissionsQuery = useUserPermissions(user?.id ?? '')
  const { push } = useToast()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [error, setError] = useState<string | undefined>()

  if (!user) return null
  const currentUserId = user.id
  const effectiveNames = new Set((permissionsQuery.data ?? []).map((permission) => permission.name))
  const fallback = new Set(FEATURES.permissions ? [] : (ROLE_DEFAULTS[user.role] ?? []))
  const effective = FEATURES.permissions ? effectiveNames : fallback

  async function save() {
    if (!displayName.trim()) {
      setError('Display name is required.')
      return
    }
    if (displayName.length > 100) {
      setError('Display name must be 100 characters or fewer.')
      return
    }
    setError(undefined)
    await updateUser.mutateAsync({ id: currentUserId, body: { displayName } })
    push({ kind: 'success', title: 'Profile saved.', body: 'Your name has been updated.' })
  }

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'Profile' }]} />
      <PageDoc title="Profile" overline="Account" kanji="手帳" tapeVariant="sora" />
      {permissionsQuery.isLoading && FEATURES.permissions ? (
        <SkeletonCard />
      ) : (
        <MetaGrid
          rows={[
            { icon: 'user', term: 'Email', detail: user.email },
            { icon: 'star', term: 'Role', detail: user.role },
            { icon: 'calendar', term: 'Member since', detail: user.createdAt ?? '—' },
          ]}
        />
      )}
      <TextField
        id="profile-name"
        label="Display name"
        value={displayName}
        error={error}
        maxLength={100}
        showCounter
        required
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <section className="ledger">
        <h2 className="ledger__heading">Permissions</h2>
        {FEATURES.permissions && permissionsQuery.isError ? (
          <ErrorState onRetry={() => void permissionsQuery.refetch()} />
        ) : null}
        {PERMISSION_GROUPS.map((group) => (
          <div key={group} className="ledger-group">
            <h3 className="ledger-group__title">{group}</h3>
            <div className="cluster">
              {[...effective]
                .filter((key) => key.startsWith(`${group}.`))
                .map((key) => (
                  <span key={key} className="tag-chip tag-chip--md">
                    {key}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </section>
      <FormActions>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
        >
          Log out
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={updateUser.isPending}
          onClick={() => void save()}
        >
          {updateUser.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </FormActions>
    </div>
  )
}
