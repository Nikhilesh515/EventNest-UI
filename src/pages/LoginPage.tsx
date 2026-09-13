import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { LoginCard } from '@/features/auth/components/LoginCard'
import { Mascot } from '@/components/brand/Mascot'
import { safeReturnUrl } from '@/lib/routes'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  async function handleSubmit(email: string, password: string) {
    await login(email, password)
    navigate(safeReturnUrl(params.get('returnUrl')), { replace: true })
  }

  return (
    <div className="cover">
      <div className="cover__art" aria-hidden="true">
        <Mascot kind="neko" size={140} />
        <p className="cover__caption">A warm stall is a lucky stall.</p>
      </div>
      <div className="cover__panel">
        <LoginCard onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
