import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/app/providers/ToastProvider'
import { AuthCover } from '@/features/auth/components/AuthCover'
import { useAuth } from '@/features/auth/AuthContext'
import { safeReturnUrl } from '@/lib/routes'

export default function LoginPage() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  async function handleSubmit({
    email,
    password,
  }: {
    displayName: string
    email: string
    password: string
  }) {
    const user = await login(email, password)
    push({
      kind: 'success',
      title: `Welcome back, ${user.displayName.split(/\s+/)[0]}! 福`,
      body: 'Your permissions are warm.',
    })
    navigate(safeReturnUrl(params.get('returnUrl')), { replace: true })
  }

  return <AuthCover kind="login" onSubmit={handleSubmit} />
}
