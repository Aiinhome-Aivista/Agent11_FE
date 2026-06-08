import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api/client'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { Spinner, MultiSelectDropdown } from '../components/ui'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      const d = res.data
      login({ id: d.user_id, full_name: d.full_name, role: d.role, email: d.email }, d.access_token)
      toast.success(`Welcome back, ${d.full_name}!`)
      navigate(d.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 text-text">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-heading text-3xl font-extrabold mb-2">
            Influence<span className="text-accent-2">AI</span>
          </div>
          <div className="text-muted text-sm">NBA Agent Platform</div>
        </div>

        <div className="card p-8">
          <h2 className="font-heading text-xl font-bold mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">Email</label>
              <input className="input w-full" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Password</label>
              <input className="input w-full" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary w-full py-2.5 flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Spinner size={16} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-5">
            No account? <Link to="/register" className="text-accent-2 hover:underline">Register as Influencer</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  // `niches` is now a list of selected niche slugs. We still send the legacy
  // `niche` field too (set to the first picked one) so that any older backend
  // version keeps working.
  const [form, setForm] = useState({ email: '', password: '', full_name: '', niches: [] })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.niches.length === 0) {
      toast.error('Please select at least one niche')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        role: 'influencer',
        // Keep `niche` populated with the first pick for back-compat.
        niche: form.niches[0],
      }
      const res = await authAPI.register(payload)
      const d = res.data
      login({ id: d.user_id, full_name: d.full_name, role: d.role, email: d.email }, d.access_token)
      toast.success('Account created! Welcome to InfluenceAI')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const NICHE_OPTIONS = ['Fashion','Lifestyle','Beauty','Tech','Food','Travel','Fitness','Gaming','Finance']

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 text-text">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-heading text-3xl font-extrabold mb-2">Influence<span className="text-accent-2">AI</span></div>
          <div className="text-muted text-sm">Join as an Influencer</div>
        </div>
        <div className="card p-8">
          <h2 className="font-heading text-xl font-bold mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">Full Name</label>
              <input className="input w-full" placeholder="Priya Rajan" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Email</label>
              <input className="input w-full" type="email" placeholder="priya@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Password</label>
              <input className="input w-full" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted">Your Niches</label>
                <span className="text-[10px] text-muted">{form.niches.length} selected</span>
              </div>
              <MultiSelectDropdown
                options={NICHE_OPTIONS.map(n => ({ value: n.toLowerCase(), label: n }))}
                selected={form.niches}
                onChange={(val) => setForm(f => ({ ...f, niches: val }))}
                placeholder="Select Niches..."
              />
              <p className="text-[10px] text-muted mt-1.5">Pick all niches that describe your content — you can be matched to campaigns from any of them.</p>
            </div>
            <button className="btn-primary w-full py-2.5 flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Spinner size={16} />}
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-5">
            Already have an account? <Link to="/login" className="text-accent-2 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
