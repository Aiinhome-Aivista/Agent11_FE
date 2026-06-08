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


// ─── Influencer: Rewards ──────────────────────────────────────────────────────

export function RewardsPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    payoutsAPI.list().then(r => setPayouts(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const total = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="p-6">
      <div className="page-header"><h1 className="section-title">Rewards & Earnings</h1></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Earned" value={`₹${total.toLocaleString('en-IN')}`} color="text-success" icon={<IndianRupee className="w-5 h-5" />} />
        <StatCard label="Pending" value={`₹${pending.toLocaleString('en-IN')}`} color="text-warn" icon={<Hourglass className="w-5 h-5" />} />
        <StatCard label="Transactions" value={payouts.length} icon={<ClipboardList className="w-5 h-5" />} />
      </div>
      <Panel title="Transaction History">
        {payouts.length === 0
          ? <EmptyState icon={<Coins className="w-12 h-12 text-muted" />} title="No transactions yet" description="Complete missions to earn rewards." />
          : <table className="tbl">
              <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Transaction ID</th></tr></thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td className="text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="font-semibold text-success">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td><Badge variant={p.status === 'paid' ? 'green' : p.status === 'failed' ? 'red' : 'amber'}>{p.status}</Badge></td>
                    <td className="text-xs text-muted font-mono">{p.transaction_id || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Panel>
    </div>
  )
}

