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


// ─── Notifications ────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => { try { const r = await notificationsAPI.list(); setNotifs(r.data || []) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await notificationsAPI.markRead(id).catch(() => {})
    setNotifs(n => n.map(x => x.id === id ? {...x, is_read: true} : x))
  }

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  return (
    <div className="p-6">
      <div className="page-header"><h1 className="section-title">Notifications</h1></div>
      <Panel>
        {notifs.length === 0
          ? <EmptyState icon={<Bell className="w-12 h-12 text-muted" />} title="All caught up!" description="No notifications yet." />
          : <div className="divide-y divide-border">
              {notifs.map(n => (
                <div key={n.id} className={`px-5 py-4 flex gap-3 cursor-pointer hover:bg-highlight ${!n.is_read ? 'bg-accent/10' : ''}`} onClick={() => markRead(n.id)}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-accent' : 'bg-border'}`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${!n.is_read ? 'text-text font-semibold' : 'text-muted'}`}>{n.title}</div>
                    <div className="text-xs text-muted mt-0.5">{n.message}</div>
                    <div className="text-xs text-muted/50 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant={n.type === 'kyc' ? 'blue' : n.type === 'payout' ? 'green' : n.type === 'fraud' ? 'red' : 'purple'}>{n.type}</Badge>
                </div>
              ))}
            </div>
        }
      </Panel>
    </div>
  )
}
