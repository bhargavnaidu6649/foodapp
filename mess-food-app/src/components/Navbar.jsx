import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 bg-husk-950 text-husk-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-display text-xl font-semibold leading-none">Mess Count</p>
          <p className="text-xs text-husk-50/50 mt-1">
            {profile?.role === 'cook' ? 'Cook dashboard' : 'Resident dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-husk-50/80">{profile?.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium bg-husk-800 hover:bg-husk-700 text-husk-50 rounded-full px-4 py-2 pill-btn"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
