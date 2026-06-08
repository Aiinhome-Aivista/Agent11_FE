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


// ─── Admin: Payouts ───────────────────────────────────────────────────────────

export function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  const load = async () => { try { const r = await payoutsAPI.list(); setPayouts(Array.isArray(r.data) ? r.data : []) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const process = async (id) => {
    setProcessing(id)
    try { await payoutsAPI.process(id); toast.success('Payout processed! Email sent.'); await load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed') } finally { setProcessing(null) }
  }

  const pending = payouts.filter(p => p.status === 'pending')
  const paid = payouts.filter(p => p.status === 'paid')

  return (
    <div className="p-6">
      <div className="page-header"><h1 className="section-title">Payouts</h1></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Pending" value={`₹${pending.reduce((s,p) => s+p.amount,0).toLocaleString('en-IN')}`} color="text-warn" icon={<Hourglass className="w-5 h-5" />} />
        <StatCard label="Processed" value={`₹${paid.reduce((s,p) => s+p.amount,0).toLocaleString('en-IN')}`} color="text-success" icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Total Transactions" value={payouts.length} icon={<ClipboardList className="w-5 h-5" />} />
      </div>
      <Panel>
        <table className="tbl">
          <thead><tr><th>Influencer ID</th><th>Amount</th><th>Status</th><th>Transaction ID</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td className="text-muted text-xs">#INF-{p.influencer_id}</td>
                <td className="font-semibold">₹{p.amount.toLocaleString('en-IN')}</td>
                <td><Badge variant={p.status === 'paid' ? 'green' : p.status === 'failed' ? 'red' : 'amber'}>{p.status}</Badge></td>
                <td className="font-mono text-xs text-muted">{p.transaction_id || '—'}</td>
                <td className="text-muted text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  {p.status === 'pending' && (
                    <button className="btn-primary text-xs py-1.5 flex items-center gap-1" onClick={() => process(p.id)} disabled={processing === p.id}>
                      {processing === p.id ? <Spinner size={11} /> : <IndianRupee size={12} />} Process
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-10">No payouts yet</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}

