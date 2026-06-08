// ═══════════════════════════════════════════════════════
// ALL PAGE COMPONENTS — InfluenceAI Platform
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { influencersAPI, campaignsAPI, missionsAPI, agentsAPI, kycAPI, payoutsAPI, ragAPI, notificationsAPI } from '../api/client'
import { StatCard, Panel, Badge, Spinner, EmptyState, Avatar, FraudBadge, EngagementPill, PlatformIcon, ProgressBar } from '../components/ui'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Upload, CheckCircle, XCircle, Eye, Play, Target, IndianRupee, Bell, IdCard, FolderArchive, Landmark, Hourglass, Mail, ClipboardList, Coins, Megaphone, Users, ShieldAlert, MessageSquare, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'


// ─── Admin: Influencers ───────────────────────────────────────────────────────

export function AdminInfluencers() {
  const [influencers, setInfluencers] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [filters, setFilters] = useState({ niche: '', min_followers: '', kyc_status: '' })

  const load = async (currentFilters = filters, isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true)
    } else {
      setSearchLoading(true)
    }
    try {
      const params = Object.fromEntries(Object.entries(currentFilters).filter(([,v]) => v))
      const res = await influencersAPI.list(params)
      setInfluencers(Array.isArray(res.data?.influencers) ? res.data.influencers : [])
    } catch {} finally {
      setInitialLoading(false)
      setSearchLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    load(filters, true)
  }, [])

  // Auto-search for text typing
  useEffect(() => {
    if (initialLoading) return

    const handler = setTimeout(() => {
      load(filters, false)
    }, 300)

    return () => clearTimeout(handler)
  }, [filters.niche, filters.min_followers])

  const hasActiveFilters = !!(filters.niche || filters.min_followers || filters.kyc_status)

  if (initialLoading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  return (
    <div className="p-6">
      <div className="page-header flex items-center gap-3">
        <h1 className="section-title">Influencer Network</h1>
        {searchLoading && <Spinner size={16} />}
      </div>
      <div className="flex gap-3 mb-5 items-center">
        {[
          { key: 'niche', placeholder: 'Filter by niche' },
          { key: 'min_followers', placeholder: 'Min followers', type: 'number' },
        ].map(f => (
          <input key={f.key} className="input text-sm" placeholder={f.placeholder} type={f.type || 'text'}
            value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))} />
        ))}
        <select
          className="input text-sm"
          value={filters.kyc_status}
          onChange={e => {
            const val = e.target.value
            setFilters(p => {
              const next = { ...p, kyc_status: val }
              load(next, false)
              return next
            })
          }}
        >
          <option value="">All KYC statuses</option>
          {['approved','pending','rejected','not_submitted'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary flex items-center gap-2" onClick={() => load(filters, false)}>
          {searchLoading ? <Spinner size={14} /> : <RefreshCw size={14} />} Refresh
        </button>
        {hasActiveFilters && (
          <button
            className="btn-ghost flex items-center gap-1.5 text-xs text-danger transition-colors"
            onClick={() => {
              const reset = { niche: '', min_followers: '', kyc_status: '' }
              setFilters(reset)
              load(reset, false)
            }}
          >
            Clear
          </button>
        )}
      </div>
      <Panel>
        <table className="tbl">
          <thead><tr><th>Influencer</th><th>Niche</th><th>Followers</th><th>Engagement</th><th>KYC</th><th>Fraud Score</th><th>Platforms</th></tr></thead>
          <tbody>
            {influencers.map(inf => (
              <tr key={inf.id}>
                <td><div className="flex items-center gap-2"><Avatar name={inf.full_name} size={7} /><div><div className="text-sm font-medium">{inf.full_name}</div><div className="text-xs text-muted">{inf.email}</div></div></div></td>
                <td className="capitalize text-muted text-sm">{inf.niche || '—'}</td>
                <td>{inf.total_followers?.toLocaleString('en-IN') || '—'}</td>
                <td><EngagementPill rate={inf.avg_engagement_rate} /></td>
                <td><Badge variant={inf.kyc_status === 'approved' ? 'green' : inf.kyc_status === 'rejected' ? 'red' : 'amber'}>{inf.kyc_status}</Badge></td>
                <td className="w-32"><FraudBadge score={inf.fraud_score} /></td>
                <td><div className="flex gap-1">{inf.social_platforms?.map(p => <PlatformIcon key={p.platform} platform={p.platform} />)}</div></td>
              </tr>
            ))}
            {influencers.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-10">No influencers found. Adjust filters.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}

