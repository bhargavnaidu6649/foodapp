import { useAuth } from '../context/AuthContext'
import UserDashboard from './UserDashboard'
import CookDashboard from './CookDashboard'

export default function Dashboard() {
  const { profile } = useAuth()

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-husk-800">Loading profile…</div>
  }

  return profile.role === 'cook' ? <CookDashboard /> : <UserDashboard />
}
