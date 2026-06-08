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


// ─── Influencer: My Dashboard ────────────────────────────────────────────────

export function InfluencerDashboard() {
  const { user } = useAuthStore()
  const [missions, setMissions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      missionsAPI.list().catch(() => ({ data: [] })),
      notificationsAPI.list().catch(() => ({ data: [] })),
    ]).then(([m, n]) => {
      setMissions(m.data || [])
      setNotifs(n.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const activeMissions = missions.filter(m => m.assignment_status === 'assigned' || m.assignment_status === 'in_progress')
  const pendingRewards = missions.filter(m => m.assignment_status === 'submitted').reduce((s, m) => s + (m.reward_amount || 0), 0)

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <Avatar name={user?.full_name || ''} size={14} />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text mb-1">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <div className="text-muted text-sm">
            You have <span className="text-accent-2 font-semibold">{activeMissions.length} active missions</span>
            {pendingRewards > 0 && <> and <span className="text-success font-semibold">₹{pendingRewards.toLocaleString('en-IN')} in pending rewards</span></>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Missions" value={activeMissions.length} icon={<Target className="w-5 h-5" />} color="text-accent-2" />
        <StatCard label="Completed" value={missions.filter(m => m.assignment_status === 'approved').length} icon={<CheckCircle className="w-5 h-5" />} color="text-success" />
        <StatCard label="Pending Rewards" value={`₹${pendingRewards.toLocaleString('en-IN')}`} icon={<IndianRupee className="w-5 h-5" />} color="text-success" />
        <StatCard label="Notifications" value={notifs.filter(n => !n.is_read).length} icon={<Bell className="w-5 h-5" />} color="text-warn" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Panel title="Active Missions">
          {activeMissions.length === 0
            ? <div className="px-5 py-8 text-center text-muted text-sm">No active missions. Check back soon!</div>
            : <div className="p-4 space-y-3">
                {activeMissions.slice(0, 3).map(m => (
                  <div key={m.id} className="bg-highlight rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm text-text">{m.title}</div>
                      <span className="text-success font-sans font-bold text-sm">₹{m.reward_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-muted">{m.deadline ? new Date(m.deadline).toLocaleDateString() : 'No deadline'}</div>
                  </div>
                ))}
              </div>
          }
        </Panel>

        <Panel title="Recent Notifications">
          <div className="divide-y divide-border">
            {notifs.slice(0, 5).map(n => (
              <div key={n.id} className="px-5 py-3 flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-border' : 'bg-accent'}`} />
                <div>
                  <div className="text-sm font-medium text-text">{n.title}</div>
                  <div className="text-xs text-muted">{n.message}</div>
                  <div className="text-xs text-muted/60 mt-0.5">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {notifs.length === 0 && <div className="px-5 py-8 text-center text-muted text-sm">No notifications yet</div>}
          </div>
        </Panel>
      </div>
    </div>
  )
}

