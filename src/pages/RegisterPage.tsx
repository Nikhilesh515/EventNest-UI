import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { RegisterCard } from '@/features/auth/components/RegisterCard'
import { Mascot } from '@/components/brand/Mascot'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(displayName: string, email: string, password: string) {
    await register({ displayName, email, password })
    navigate('/events', { replace: true })
  }

  return (
    <div className="cover">
      <div className="cover__art" aria-hidden="true">
        <Mascot kind="neko" size={140} />
        <p className="cover__caption">Your stall is ready. 招</p>
      </div>
      <div className="cover__panel">
        <RegisterCard onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
