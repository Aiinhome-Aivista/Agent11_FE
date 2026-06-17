import { useState, useEffect } from 'react'
import { missionsAPI, campaignsAPI } from '../api/client'
import { Panel, Badge, Spinner, PlatformIcon } from '../components/ui'
import toast from 'react-hot-toast'
import { CheckCircle, X, BarChart2, Eye, MessageSquare, Heart, TrendingUp, TrendingDown, Loader2, Plus, Globe } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube',   label: 'YouTube'   },
  { id: 'facebook',  label: 'Facebook'  },
]

export function AdminMissions() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)

  // Insights side panel. `selectedRow` represents a *single platform's*
  // submission within an assignment, since multi-platform missions get one
  // row per platform.
  const [selectedRow, setSelectedRow] = useState(null)   // { assignment, platform, url }
  const [insightData, setInsightData] = useState(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [timeframe, setTimeframe] = useState('week')

  // Create-mission modal state
  const [showCreate, setShowCreate] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    campaign_id: '',
    title: '',
    description: '',
    content_type: '',
    platforms: [],
    territory: '',
    reward_amount: '',
    deadline: '',
  })

  const load = async () => {
    try {
      const assignRes = await missionsAPI.listAssignments()
      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : [])
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  // Lazily load campaigns the first time the admin opens the create modal.
  useEffect(() => {
    if (showCreate && campaigns.length === 0) {
      campaignsAPI.list().then(r => setCampaigns(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    }
  }, [showCreate])

  const handleApprove = async (assignmentId) => {
    setApproving(assignmentId)
    try {
      await missionsAPI.approve(assignmentId)
      toast.success('Mission approved! Payout queued.')
      await load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to approve') }
    finally { setApproving(null) }
  }

  const openInsights = async (assignment, platform, url) => {
    setSelectedRow({ assignment, platform, url })
    setInsightData(null)
    setInsightLoading(true)
    setTimeframe('week')
    try {
      // Pass the explicit platform so the backend pulls the right URL out
      // of submission_urls. For single-platform missions, `platform` is the
      // sole entry and the backend still respects it.
      const res = await missionsAPI.insights(assignment.assignment_id, platform)
      setInsightData(res.data)
    } catch (err) {
      toast.error('Failed to load insights')
      console.error(err)
    } finally {
      setInsightLoading(false)
    }
  }

  const closeInsights = () => {
    setSelectedRow(null)
    setInsightData(null)
  }

  // Flatten assignments into one row per (assignment, platform). Multi-
  // platform missions yield N rows so each platform can be reviewed and
  // analysed independently.
  const reviewRows = () => {
    const out = []
    for (const a of assignments) {
      if (a.status !== 'submitted' && a.status !== 'approved') continue
      const urlsMap = a.submission_urls || {}
      const platforms = (Array.isArray(a.platforms) && a.platforms.length > 0)
        ? a.platforms
        : (a.platform ? [a.platform] : ['post'])
      
      let allSubmitted = false;
      if (a.submission_url && (!a.submission_urls || Object.keys(a.submission_urls).length === 0)) {
         allSubmitted = true;
      } else if (platforms.length > 0) {
         allSubmitted = platforms.every(p => urlsMap[p]);
      } else {
         allSubmitted = !!a.submission_url;
      }

      out.push({
        ...a,
        row_key: a.assignment_id,
        all_platforms: platforms,
        urls_map: urlsMap,
        legacy_url: a.submission_url,
        all_submitted: allSubmitted
      })
    }
    return out
  }

  const togglePlatform = (id) => {
    setForm(f => {
      const has = f.platforms.includes(id)
      return { ...f, platforms: has ? f.platforms.filter(p => p !== id) : [...f.platforms, id] }
    })
  }

  const createMission = async () => {
    if (!form.campaign_id) return toast.error('Select a campaign')
    if (!form.title.trim()) return toast.error('Enter a mission title')
    if (form.platforms.length === 0) return toast.error('Pick at least one platform')
    if (!form.reward_amount || isNaN(parseFloat(form.reward_amount))) return toast.error('Enter a reward amount')

    setCreating(true)
    try {
      const payload = {
        campaign_id: parseInt(form.campaign_id, 10),
        title: form.title.trim(),
        description: form.description.trim() || null,
        content_type: form.content_type.trim() || null,
        platforms: form.platforms,
        // Mirror first platform into the legacy single-value field for
        // back-compat with any code path still reading `platform`.
        platform: form.platforms[0],
        territory: form.territory.trim() || null,
        reward_amount: parseFloat(form.reward_amount),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      }
      await missionsAPI.create(payload)
      toast.success('Mission created')
      setShowCreate(false)
      setForm({ campaign_id: '', title: '', description: '', content_type: '', platforms: [], territory: '', reward_amount: '', deadline: '' })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create mission')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const stats = insightData?.summary_stats
  const chartSource = insightData?.engagement_over_time
  const rows = reviewRows()

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title">Mission Review Queue</h1>
          <p className="text-sm text-muted mt-1">Review and approve influencer mission submissions.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Mission
        </button>
      </div>

      {/* Create-mission modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card p-6 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading font-bold text-lg mb-4">Create Mission</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-muted block mb-1">Campaign *</label>
                <select className="input w-full" value={form.campaign_id} onChange={e => setForm(f => ({ ...f, campaign_id: e.target.value }))}>
                  <option value="">Select a campaign…</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted block mb-1">Mission Title *</label>
                <input className="input w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Summer Collection Unboxing" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted block mb-1">Description</label>
                <textarea className="input w-full" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief, what's expected…" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Content Type</label>
                <input className="input w-full" value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))} placeholder="reel, post, short…" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Territory</label>
                <input className="input w-full" value={form.territory} onChange={e => setForm(f => ({ ...f, territory: e.target.value }))} placeholder="e.g., India, Mumbai, South Asia" />
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted">Target Platforms *</label>
                  <span className="text-[10px] text-muted">{form.platforms.length} selected</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORM_OPTIONS.map(p => {
                    const active = form.platforms.includes(p.id)
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`text-xs px-3 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                          active
                            ? 'bg-accent/20 border-accent text-accent font-semibold'
                            : 'border-white/10 text-muted hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <PlatformIcon platform={p.id} />
                        <span>{p.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Reward Amount (₹) *</label>
                <input className="input w-full" type="number" value={form.reward_amount} onChange={e => setForm(f => ({ ...f, reward_amount: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Deadline</label>
                <input className="input w-full" type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={createMission} disabled={creating}>
                {creating ? <Spinner size={14} /> : <CheckCircle size={14} />} Create
              </button>
              <button className="btn-ghost flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Panel>
        <table className="tbl">
          <thead>
            <tr>
              <th>Mission</th>
              <th>Influencer</th>
              <th>Platform</th>
              <th>Reward</th>
              <th>Status</th>
              <th>Submission</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.row_key}>
                <td className="font-medium text-accent">
                  {r.mission_title}
                  {r.territory && <span className="block text-[10px] text-muted font-normal">{r.territory}</span>}
                </td>
                <td className="text-sm">{r.influencer_name}</td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                    {r.all_platforms.map(p => (
                      <div key={p} title={p} className="cursor-help transition-transform hover:scale-110">
                        {p !== 'post' ? <PlatformIcon platform={p} /> : <Globe size={16} className="text-muted" />}
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="font-medium text-success">₹{r.reward_amount?.toLocaleString('en-IN') || 0}</div>
                  {r.all_platforms.length > 1 && <div className="text-[10px] text-muted">(Total Package)</div>}
                </td>
                <td><Badge variant={r.status === 'approved' ? 'green' : 'warn'}>{r.status}</Badge></td>
                <td>
                  <div className="flex items-center gap-2">
                    {r.all_platforms.map(p => {
                      const url = r.urls_map[p] || (r.all_platforms.length === 1 ? r.legacy_url : null)
                      return url ? (
                        <div key={p} className="flex items-center bg-accent/5 border border-accent/20 rounded overflow-hidden">
                          <a href={url} target="_blank" rel="noreferrer" title={`View ${p} Post`} className="p-1 hover:bg-accent/10 text-accent transition-colors flex items-center justify-center">
                            <div className="scale-75 origin-center pointer-events-none">{p !== 'post' ? <PlatformIcon platform={p} /> : <Globe size={16}/>}</div>
                          </a>
                          <button onClick={() => openInsights(r, p, url)} title={`Analyse ${p}`} className="p-1.5 hover:bg-accent/10 text-accent border-l border-accent/20 transition-colors flex items-center justify-center">
                            <BarChart2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div key={p} className="p-1 opacity-40 grayscale cursor-not-allowed flex items-center justify-center bg-surface border border-divider rounded" title={`${p} pending`}>
                          <div className="scale-75 origin-center pointer-events-none">{p !== 'post' ? <PlatformIcon platform={p} /> : <Globe size={16}/>}</div>
                        </div>
                      )
                    })}
                  </div>
                </td>
                <td>
                  {r.status === 'submitted' ? (
                    <button
                      className={`text-xs py-1.5 px-3 flex items-center gap-1 rounded transition-colors ${r.all_submitted ? 'btn-primary' : 'bg-surface text-muted border border-divider cursor-not-allowed'}`}
                      onClick={() => r.all_submitted && handleApprove(r.assignment_id)}
                      disabled={approving === r.assignment_id || !r.all_submitted}
                      title={!r.all_submitted ? "Waiting for all platform submissions" : ""}
                    >
                      {approving === r.assignment_id ? <Spinner size={12} /> : <CheckCircle size={12} />} Approve
                    </button>
                  ) : (
                    <span className="text-success text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Approved</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-10">No missions pending review</td></tr>
            )}
          </tbody>
        </table>
      </Panel>

      {/* Analytics Sidebar Overlay */}
      {selectedRow && (
        <>
          <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 transition-opacity"></div>

          <div className="fixed inset-y-0 right-0 w-[450px] bg-card border-l border-border shadow-2xl z-50 p-6 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
              <div>
                <h2 className="text-lg font-bold text-foreground">Post Insights</h2>
                <p className="text-xs text-muted mt-1">
                  {selectedRow.mission_title} • {selectedRow.influencer_name}
                  {selectedRow.row_platform && selectedRow.row_platform !== 'post' &&
                    <> • <span className="capitalize">{selectedRow.row_platform}</span></>}
                </p>
                {insightData?.data_source === 'youtube_api' && (
                  <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded mt-1 inline-block font-bold">LIVE DATA</span>
                )}
              </div>
              <button className="btn-ghost p-2 rounded-full hover:bg-surface" onClick={closeInsights}>
                <X size={18} />
              </button>
            </div>

            {insightLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted">
                <Loader2 size={32} className="animate-spin mb-4" />
                <div className="text-sm font-medium">Analyzing post performance...</div>
              </div>
            ) : insightData ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-surface p-4 rounded-xl border border-divider shadow-sm">
                    <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><Eye size={12}/> Views</div>
                    <div className="font-bold text-xl">{stats?.views?.formatted || '—'}</div>
                    <div className={`text-xs flex items-center mt-1 font-medium ${stats?.views?.trend_direction === 'up' ? 'text-success' : 'text-danger'}`}>
                      {stats?.views?.trend_direction === 'up' ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                      {stats?.views?.trend_direction === 'up' ? '+' : '-'}{Math.abs(stats?.views?.trend_percentage || 0)}%
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-divider shadow-sm">
                    <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><Heart size={12}/> Likes</div>
                    <div className="font-bold text-xl">{stats?.likes?.formatted || '—'}</div>
                    <div className={`text-xs flex items-center mt-1 font-medium ${stats?.likes?.trend_direction === 'up' ? 'text-success' : 'text-danger'}`}>
                      {stats?.likes?.trend_direction === 'up' ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                      {stats?.likes?.trend_direction === 'up' ? '+' : '-'}{Math.abs(stats?.likes?.trend_percentage || 0)}%
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-divider shadow-sm">
                    <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><MessageSquare size={12}/> Comments</div>
                    <div className="font-bold text-xl">{stats?.comments?.formatted || '—'}</div>
                    <div className={`text-xs flex items-center mt-1 font-medium ${stats?.comments?.trend_direction === 'up' ? 'text-success' : 'text-danger'}`}>
                      {stats?.comments?.trend_direction === 'up' ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                      {stats?.comments?.trend_direction === 'up' ? '+' : '-'}{Math.abs(stats?.comments?.trend_percentage || 0)}%
                    </div>
                  </div>
                </div>

                <div className="bg-surface p-5 rounded-xl border border-divider mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground"><BarChart2 size={16} className="text-accent"/> Engagement Over Time</h3>
                    <div className="flex bg-background border border-divider rounded-lg overflow-hidden">
                      {['week', 'month', 'year'].map(tf => (
                        <button
                          key={tf}
                          className={`text-[10px] uppercase font-bold px-2.5 py-1 transition-colors ${timeframe === tf ? 'bg-accent text-white' : 'text-muted hover:bg-surface'}`}
                          onClick={() => setTimeframe(tf)}
                        >
                          {tf === 'week' ? '7D' : tf === 'month' ? '30D' : '1Y'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartSource?.[timeframe] || []} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                        <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                        <YAxis yAxisId="left" fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                        <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border-default)', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ padding: 0 }}
                        />
                        <Line yAxisId="left" type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} name="Views" />
                        <Line yAxisId="right" type="monotone" dataKey="likes" stroke="var(--warn)" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} name="Likes" />
                        <Line yAxisId="right" type="monotone" dataKey="comments" stroke="var(--success)" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} name="Comments" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-accent/10 p-5 rounded-xl border border-accent/20 mt-auto">
                  <h4 className="text-xs font-bold text-accent mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={14} /> AI Analysis
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {insightData.ai_analysis}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted text-sm">
                Failed to load insights.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
