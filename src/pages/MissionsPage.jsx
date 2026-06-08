// ═══════════════════════════════════════════════════════
// ALL PAGE COMPONENTS — InfluenceAI Platform
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { influencersAPI, campaignsAPI, missionsAPI, agentsAPI, kycAPI, payoutsAPI, ragAPI, notificationsAPI } from '../api/client'
import { StatCard, Panel, Badge, Spinner, EmptyState, Avatar, FraudBadge, EngagementPill, PlatformIcon, ProgressBar } from '../components/ui'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Upload, CheckCircle, XCircle, Eye, Play, Target, IndianRupee, Bell, IdCard, FolderArchive, Landmark, Hourglass, Mail, ClipboardList, Coins, Megaphone, Users, ShieldAlert, MessageSquare, Search, Link } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'


// ─── Influencer: Missions ─────────────────────────────────────────────────────

export function MissionsPage() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  // urlsByMission: { [missionId]: { instagram: "...", youtube: "..." } } for
  // multi-platform missions, or { _single: "..." } for legacy single ones.
  const [urlsByMission, setUrlsByMission] = useState({})
  const [showSubmit, setShowSubmit] = useState(null)

  const load = async () => {
    try {
      const res = await missionsAPI.list()
      setMissions(res.data || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Pick the list of platforms for a mission. Always returns at least one
  // entry — falls back to a synthetic "post" platform so missions that
  // don't specify a platform still get a single input field.
  const platformsOf = (m) => {
    if (Array.isArray(m.platforms) && m.platforms.length > 0) return m.platforms
    if (m.platform) return [m.platform]
    return ['post']
  }

  const setUrl = (missionId, platform, value) => {
    setUrlsByMission(prev => ({
      ...prev,
      [missionId]: { ...(prev[missionId] || {}), [platform]: value },
    }))
  }

  const submit = async (mission) => {
    const platforms = platformsOf(mission)
    const urls = urlsByMission[mission.id] || {}

    // Build a clean { platform: url } map of only non-empty entries.
    const cleanUrls = {}
    for (const p of platforms) {
      const v = (urls[p] || '').trim()
      if (v) cleanUrls[p] = v
    }

    if (Object.keys(cleanUrls).length === 0) {
      return toast.error('Paste at least one post URL')
    }

    // Encourage (but don't force) submitting all platforms — warn if some
    // are missing so the influencer can decide.
    const missing = platforms.filter(p => !cleanUrls[p])
    if (missing.length > 0 && platforms.length > 1) {
      const proceed = window.confirm(
        `You haven't added a URL for: ${missing.join(', ')}.\nSubmit anyway?`
      )
      if (!proceed) return
    }

    setSubmitting(mission.id)
    try {
      // For multi-platform missions, send the dict. For single-platform
      // missions, send the legacy `submission_url` for back-compat.
      const payload = platforms.length === 1
        ? { submission_url: cleanUrls[platforms[0]] }
        : { submission_urls: cleanUrls }

      await missionsAPI.submit(mission.id, payload)
      toast.success('Submitted for review!')
      setShowSubmit(null)
      setUrlsByMission(prev => ({ ...prev, [mission.id]: {} }))
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const byStatus = {
    active: missions.filter(m => ['assigned', 'in_progress'].includes(m.assignment_status)),
    submitted: missions.filter(m => m.assignment_status === 'submitted'),
    approved: missions.filter(m => m.assignment_status === 'approved'),
  }

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title">My Missions</h1>
          <p className="text-muted text-sm mt-1">{missions.length} total missions assigned</p>
        </div>
      </div>

      {['active', 'submitted', 'approved'].map(status => (
        byStatus[status].length > 0 && (
          <div key={status} className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-accent' : status === 'submitted' ? 'bg-warn' : 'bg-success'}`} />
              {status === 'active' ? 'Active' : status === 'submitted' ? 'Pending Review' : 'Completed'} ({byStatus[status].length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {byStatus[status].map(m => {
                const platforms = platformsOf(m)
                const multi = platforms.length > 1
                return (
                  <div key={m.id} className={`card p-5 ${status === 'approved' ? 'opacity-70' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="font-heading font-bold text-sm">{m.title}</div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {platforms.filter(p => p !== 'post').map(p => (
                          <PlatformIcon key={p} platform={p} />
                        ))}
                      </div>
                    </div>
                    {m.description && <div className="text-xs text-muted mb-3 leading-relaxed">{m.description}</div>}
                    {m.territory && (
                      <div className="text-[10px] text-muted mb-3 uppercase tracking-wider">
                        Territory: <span className="text-text font-medium">{m.territory}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-success font-sans font-bold">₹{m.reward_amount?.toLocaleString('en-IN')}</span>
                      {m.deadline && <span className="text-xs text-muted">{new Date(m.deadline).toLocaleDateString()}</span>}
                    </div>

                    {status === 'active' && (
                      showSubmit === m.id
                        ? <div className="space-y-2">
                            {/* One input per platform when multi-platform; a
                                single input otherwise. */}
                            {platforms.map(p => (
                              <div key={p}>
                                {multi && (
                                  <label className="text-[10px] uppercase tracking-wider text-muted block mb-1 flex items-center gap-1">
                                    {p !== 'post' && <PlatformIcon platform={p} />}
                                    <span>{p === 'post' ? 'Post URL' : `${p} URL`}</span>
                                  </label>
                                )}
                                <input
                                  className="input w-full text-xs"
                                  placeholder={multi ? `Paste your ${p} post URL…` : 'Paste post URL here…'}
                                  value={(urlsByMission[m.id] || {})[p] || ''}
                                  onChange={e => setUrl(m.id, p, e.target.value)}
                                />
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <button className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1" onClick={() => submit(m)} disabled={submitting === m.id}>
                                {submitting === m.id ? <Spinner size={12} /> : <CheckCircle size={12} />} Submit
                              </button>
                              <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => setShowSubmit(null)}>Cancel</button>
                            </div>
                          </div>
                        : <button className="btn-primary w-full text-xs py-2" onClick={() => setShowSubmit(m.id)}>
                            Submit Mission
                          </button>
                    )}
                    {status === 'submitted' && <div className="text-xs text-warn rounded-lg px-3 py-2 text-center flex items-center justify-center gap-1.5" style={{ backgroundColor: 'var(--warn-bg)' }}><Hourglass size={12} /> Awaiting review</div>}
                    {status === 'approved' && (
                      <div className="space-y-1">
                        {m.submission_urls && Object.keys(m.submission_urls).length > 0
                          ? Object.entries(m.submission_urls).map(([p, url]) => (
                              <div key={p} className="text-xs text-muted truncate flex items-center gap-1">
                                <Link size={12} />
                                <span className="uppercase text-[9px] text-muted/70 mr-1">{p}</span>
                                <a href={url} target="_blank" rel="noreferrer" className="hover:underline truncate">{url}</a>
                              </div>
                            ))
                          : m.submission_url && (
                              <div className="text-xs text-muted truncate flex items-center gap-1"><Link size={12} /> {m.submission_url}</div>
                            )}
                        <div className="text-xs text-success mt-1 flex items-center gap-1"><CheckCircle size={12} /> Approved — payout queued</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      ))}

      {missions.length === 0 && <EmptyState icon={<Target className="w-12 h-12 text-muted" />} title="No missions yet" description="Campaigns will assign missions to you based on your profile and KYC status." />}
    </div>
  )
}
