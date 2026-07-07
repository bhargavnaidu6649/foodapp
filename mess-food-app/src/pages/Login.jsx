import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await signIn({ email, password })
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grain flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-husk-50 border border-husk-800/10 rounded-card shadow-xl p-8">
        <p className="text-saffron-600 text-sm font-semibold tracking-wide uppercase mb-1">Mess Count</p>
        <h1 className="font-display text-3xl font-semibold text-husk-950 mb-6">Welcome back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-husk-800/20 px-4 py-2.5 bg-white focus:border-saffron-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-husk-800/20 px-4 py-2.5 bg-white focus:border-saffron-500 outline-none"
              placeholder="Your password"
            />
          </div>

          <button
            disabled={busy}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-husk-950 font-semibold rounded-xl py-3 mt-2 pill-btn disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-husk-800/70 mt-6 text-center">
          New here?{' '}
          <Link to="/register" className="text-saffron-600 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
