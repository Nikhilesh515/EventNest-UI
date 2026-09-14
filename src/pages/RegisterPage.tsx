import { useNavigate } from 'react-router-dom'
import { useToast } from '@/app/providers/ToastProvider'
import { AuthCover } from '@/features/auth/components/AuthCover'
import { useAuth } from '@/features/auth/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  async function handleSubmit({
    displayName,
    email,
    password,
  }: {
    displayName: string
    email: string
    password: string
  }) {
    await register({ displayName, email, password })
    push({
      kind: 'success',
      title: 'Welcome to EventNest! 福',
      body: 'Your permissions are warm.',
    })
    navigate('/events', { replace: true })
  }

  return <AuthCover kind="register" onSubmit={handleSubmit} />
}
