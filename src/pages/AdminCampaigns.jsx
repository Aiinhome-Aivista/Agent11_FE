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


// ─── Admin: Campaigns ─────────────────────────────────────────────────────────

export function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', niche_target: '', budget: '', min_followers: 10000, min_engagement: 2, target_platforms: [], deliverables: '' })
  const [showForm, setShowForm] = useState(false)
  const [roiResults, setRoiResults] = useState({})
  const [loadingRoi, setLoadingRoi] = useState(null)

  const predictRoi = async (campaignId) => {
    setLoadingRoi(campaignId)
    try {
      const res = await agentsAPI.roi(campaignId)
      setRoiResults(prev => ({ ...prev, [campaignId]: res.data }))
      toast.success('ROI predicted!')
    } catch (err) { toast.error(err.response?.data?.detail || 'ROI prediction failed') }
    finally { setLoadingRoi(null) }
  }

  const load = async () => { try { const r = await campaignsAPI.list(); setCampaigns(Array.isArray(r.data) ? r.data : []) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const create = async () => {
    setCreating(true)
    try {
      await campaignsAPI.create({ ...form, budget: parseFloat(form.budget) })
      toast.success('Campaign created!')
      setShowForm(false); await load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') } finally { setCreating(false) }
  }

  return (
    <div className="p-6">
      <div className="page-header">
        <h1 className="section-title">Campaigns</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(s => !s)}>
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-heading font-bold mb-4">Create Campaign</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-muted block mb-1">Campaign Name *</label><input className="input w-full" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><label className="text-xs text-muted block mb-1">Niche Target</label><input className="input w-full" placeholder="fashion, lifestyle…" value={form.niche_target} onChange={e => setForm(f => ({...f, niche_target: e.target.value}))} /></div>
            <div><label className="text-xs text-muted block mb-1">Budget (₹) *</label><input className="input w-full" type="number" value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))} /></div>
            <div><label className="text-xs text-muted block mb-1">Min Followers</label><input className="input w-full" type="number" value={form.min_followers} onChange={e => setForm(f => ({...f, min_followers: parseInt(e.target.value)}))} /></div>
            <div><label className="text-xs text-muted block mb-1">Min Engagement %</label><input className="input w-full" type="number" step="0.1" value={form.min_engagement} onChange={e => setForm(f => ({...f, min_engagement: parseFloat(e.target.value)}))} /></div>
            <div><label className="text-xs text-muted block mb-1">Deliverables</label><input className="input w-full" placeholder="e.g., 1 reel + 2 stories" value={form.deliverables} onChange={e => setForm(f => ({...f, deliverables: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary flex items-center gap-2" onClick={create} disabled={creating || !form.name || !form.budget}>
              {creating ? <Spinner size={14} /> : <CheckCircle size={14} />} Create
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Panel>
        <table className="tbl">
          <thead><tr><th>Campaign</th><th>Niche</th><th>Budget</th><th>Status</th><th>Predicted ROI</th><th>Action</th></tr></thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td className="text-muted text-sm capitalize">{c.niche_target || '—'}</td>
                <td>₹{c.budget.toLocaleString('en-IN')}</td>
                <td><Badge variant={c.status === 'active' ? 'green' : c.status === 'draft' ? 'amber' : 'blue'}>{c.status}</Badge></td>
                <td>
                  {roiResults[c.id] ? (
                    <div>
                      <span className={`font-sans font-bold text-sm ${roiResults[c.id].predicted_roi >= 0 ? 'text-success' : 'text-danger'}`}>
                        {roiResults[c.id].predicted_roi}%
                      </span>
                    </div>
                  ) : c.predicted_roi ? (
                    <span className="text-success font-semibold">{c.predicted_roi}%</span>
                  ) : (
                    <span className="text-muted text-xs">Not predicted</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-ghost text-xs py-1.5 flex items-center gap-1"
                    onClick={() => predictRoi(c.id)}
                    disabled={loadingRoi === c.id}
                  >
                    {loadingRoi === c.id ? <Spinner size={11} /> : <Play size={11} />} Predict ROI
                  </button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">No campaigns. Create one above.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}

