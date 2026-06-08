import { useState, useEffect } from 'react'
import { socialAPI } from '../api/client'
import toast from 'react-hot-toast'
import { Panel, Spinner, PlatformIcon, Badge } from '../components/ui'
import { RefreshCw, Link, CheckCircle, AlertCircle, Instagram, Youtube, Facebook, Key } from 'lucide-react'

const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram size={20} className="text-white" />,
    color: 'from-pink-500 to-orange-400',
    placeholder: 'https://www.instagram.com/username or @username',
    note: 'Requires Instagram Business/Creator account + Meta OAuth. Click "Connect with Meta" first.',
    requiresOAuth: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube size={20} className="text-white" />,
    color: 'from-red-500 to-red-600',
    placeholder: 'https://www.youtube.com/@YourChannel or channel URL',
    note: 'Public data fetched using YouTube API. No login required for public channels.',
    requiresOAuth: false,
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    icon: <Facebook size={20} className="text-white" />,
    color: 'from-blue-500 to-blue-700',
    placeholder: 'https://www.facebook.com/YourPageName',
    note: 'Requires Facebook Page Admin access token via Meta OAuth.',
    requiresOAuth: true,
  },
]

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)
  const [forms, setForms] = useState({ instagram: '', youtube: '', facebook: '' })
  const [refreshing, setRefreshing] = useState(null)

  const load = async () => {
    try {
      const res = await socialAPI.myAccounts()
      setAccounts(res.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const connect = async (platform) => {
    const url = forms[platform]?.trim()
    if (!url) return toast.error('Paste your profile URL first')

    if ((platform === 'instagram' || platform === 'facebook')) {
      toast('Redirecting to Meta OAuth…\nAfter authorization, paste the token here.', { icon: <Key size={16} className="text-accent" /> })
      window.open('/api/auth/instagram', '_blank', 'width=600,height=700')
      return
    }

    setConnecting(platform)
    try {
      const res = await socialAPI.connect({ platform, profile_url: url })
      toast.success(`${platform} connected! Stats synced.`)
      setForms(f => ({ ...f, [platform]: '' }))
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Connection failed. Check your URL and API keys.')
    } finally {
      setConnecting(null)
    }
  }

  const refresh = async (platform) => {
    setRefreshing(platform)
    try {
      await socialAPI.refresh(platform)
      toast.success('Stats refreshed!')
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Refresh failed')
    } finally {
      setRefreshing(null)
    }
  }

  const getAccount = (platform) => accounts.find(a => a.platform === platform)

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title">Social Accounts</h1>
          <p className="text-muted text-sm mt-1">Connect your Instagram, YouTube, and Facebook to sync real stats</p>
        </div>
      </div>

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {accounts.map(acct => (
            <div key={acct.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <PlatformIcon platform={acct.platform} />
                <div>
                  <div className="font-semibold text-sm capitalize">{acct.platform}</div>
                  <div className="text-xs text-muted">@{acct.username}</div>
                </div>
                <Badge variant="green">✓ Connected</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-highlight rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Followers</div>
                  <div className="font-sans font-bold text-base">
                    {acct.followers_count?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-highlight rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Engagement</div>
                  <div className={`font-sans font-bold text-base ${acct.engagement_rate >= 3 ? 'text-success' : 'text-warn'}`}>
                    {acct.engagement_rate?.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-highlight rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Avg Likes</div>
                  <div className="font-semibold text-sm">{acct.avg_likes?.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-highlight rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">
                    {acct.platform === 'youtube' ? 'Avg Views' : 'Posts'}
                  </div>
                  <div className="font-semibold text-sm">
                    {acct.platform === 'youtube'
                      ? acct.avg_views?.toLocaleString('en-IN')
                      : acct.posts_count}
                  </div>
                </div>
              </div>

              {acct.last_synced_at && (
                <div className="text-xs text-muted mb-3">
                  Last synced: {new Date(acct.last_synced_at).toLocaleString()}
                </div>
              )}

              <button
                className="btn-ghost w-full flex items-center justify-center gap-2 text-xs py-1.5"
                onClick={() => refresh(acct.platform)}
                disabled={refreshing === acct.platform}
              >
                {refreshing === acct.platform ? <Spinner size={12} /> : <RefreshCw size={12} />}
                Refresh Stats
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Connect new accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLATFORMS.map(platform => {
          const connected = getAccount(platform.id)
          return (
            <div key={platform.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-xl`}>
                  {platform.icon}
                </div>
                <div>
                  <div className="font-heading font-bold text-sm">{platform.name}</div>
                  {connected
                    ? <div className="text-xs text-success">@{connected.username}</div>
                    : <div className="text-xs text-muted">Not connected</div>
                  }
                </div>
              </div>

              <div className="text-xs text-muted bg-highlight rounded-lg p-3 mb-4 leading-relaxed">
                {platform.note}
              </div>

              {!connected && (
                <>
                  <input
                    className="input w-full mb-3 text-xs"
                    placeholder={platform.placeholder}
                    value={forms[platform.id]}
                    onChange={e => setForms(f => ({ ...f, [platform.id]: e.target.value }))}
                  />
                  <button
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    onClick={() => connect(platform.id)}
                    disabled={connecting === platform.id}
                  >
                    {connecting === platform.id ? <Spinner size={14} className="text-white" /> : <Link size={14} />}
                    {platform.requiresOAuth ? 'Connect with Meta' : `Connect ${platform.name}`}
                  </button>
                </>
              )}

              {connected && (
                <div className="flex items-center gap-2 text-xs text-success bg-success/10 rounded-lg px-3 py-2">
                  <CheckCircle size={13} />
                  Connected as @{connected.username}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* API Key notice */}
      <div className="mt-6 p-4 bg-warn/5 border border-warn/20 rounded-xl text-xs text-warn leading-relaxed">
        <strong>⚠️ API Keys Required:</strong> YouTube requires <code>YOUTUBE_API_KEY</code> in backend <code>.env</code>.
        Instagram/Facebook requires <code>INSTAGRAM_APP_ID</code> + <code>INSTAGRAM_APP_SECRET</code> and a Meta App with
        Instagram Graph API enabled. See <code>backend/.env.example</code> for setup.
      </div>
    </div>
  )
}
