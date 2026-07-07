import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'user',
  })
  const [busy, setBusy] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await signUp(form)
      toast.success('Account created. You can sign in now.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grain flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-husk-50 border border-husk-800/10 rounded-card shadow-xl p-8">
        <p className="text-saffron-600 text-sm font-semibold tracking-wide uppercase mb-1">Mess Count</p>
        <h1 className="font-display text-3xl font-semibold text-husk-950 mb-6">Create your account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-1">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="w-full rounded-xl border border-husk-800/20 px-4 py-2.5 bg-white focus:border-saffron-500 outline-none"
              placeholder="e.g. Arun Kumar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-1">Phone (optional)</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-xl border border-husk-800/20 px-4 py-2.5 bg-white focus:border-saffron-500 outline-none"
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-xl border border-husk-800/20 px-4 py-2.5 bg-white focus:border-saffron-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-1">Password</label>
            <input
              required
              minLength={6}
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full rounded-xl border border-husk-800/20 px-4 py-2.5 bg-white focus:border-saffron-500 outline-none"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-husk-800 mb-2">I am a</label>
            <div className="flex gap-3">
              {[
                { v: 'user', label: 'Resident (eats meals)' },
                { v: 'cook', label: 'Cook / Mess manager' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => update('role', opt.v)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium pill-btn ${
                    form.role === opt.v
                      ? 'bg-husk-900 text-husk-50 border-husk-900'
                      : 'border-husk-800/20 text-husk-800 hover:border-husk-800/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-husk-950 font-semibold rounded-xl py-3 mt-2 pill-btn disabled:opacity-60"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-husk-800/70 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-saffron-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
