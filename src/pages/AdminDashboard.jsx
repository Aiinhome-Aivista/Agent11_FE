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


// ─── Admin: Dashboard ─────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      campaignsAPI.list().catch(() => ({ data: [] })),
      influencersAPI.list({ limit: 10 }).catch(() => ({ data: { influencers: [] } })),
    ]).then(([c, i]) => {
      setCampaigns(Array.isArray(c?.data) ? c.data : [])
      setInfluencers(Array.isArray(i?.data?.influencers) ? i.data.influencers : [])
    }).catch(() => {
      setCampaigns([])
      setInfluencers([])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalInfluencers = influencers.length
  const flagged = influencers.filter(i => i.fraud_score > 60).length

  return (
    <div className="p-6">
      <div className="page-header">
        <h1 className="section-title">Admin Dashboard</h1>
        <Badge variant="green">Platform Operational</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Campaigns" value={activeCampaigns} icon={<Megaphone className="w-5 h-5" />} color="text-accent-2" />
        <StatCard label="Influencers" value={totalInfluencers} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Fraud Flagged" value={flagged} icon={<ShieldAlert className="w-5 h-5" />} color={flagged > 0 ? 'text-danger' : 'text-success'} />
        <StatCard label="Total Budget" value={`₹${(campaigns.reduce((s,c) => s+c.budget, 0) / 100000).toFixed(1)}L`} icon={<IndianRupee className="w-5 h-5" />} color="text-success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Panel title="Campaigns">
          <table className="tbl">
            <thead><tr><th>Campaign</th><th>Budget</th><th>Status</th></tr></thead>
            <tbody>
              {campaigns.slice(0, 6).map(c => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>₹{c.budget.toLocaleString('en-IN')}</td>
                  <td><Badge variant={c.status === 'active' ? 'green' : c.status === 'draft' ? 'amber' : 'blue'}>{c.status}</Badge></td>
                </tr>
              ))}
              {campaigns.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-6">No campaigns yet</td></tr>}
            </tbody>
          </table>
        </Panel>

        <Panel title="Top Influencers">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Followers</th><th>Engagement</th><th>Fraud</th></tr></thead>
            <tbody>
              {influencers
                .slice()
                .sort((a, b) => {
                  const followerDiff = (b.total_followers || 0) - (a.total_followers || 0);
                  if (followerDiff !== 0) return followerDiff;
                  return (b.avg_engagement_rate || 0) - (a.avg_engagement_rate || 0);
                })
                .slice(0, 5)
                .map(inf => (
                <tr key={inf.id}>
                  <td><div className="flex items-center gap-2"><Avatar name={inf.full_name} size={7} /><span className="text-sm">{inf.full_name}</span></div></td>
                  <td>{inf.total_followers?.toLocaleString('en-IN') || '0'}</td>
                  <td><EngagementPill rate={inf.avg_engagement_rate} /></td>
                  <td><FraudBadge score={inf.fraud_score} /></td>
                </tr>
              ))}
              {influencers.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-6">No influencers yet</td></tr>}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  )
}

