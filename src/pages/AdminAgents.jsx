// ═══════════════════════════════════════════════════════
// ALL PAGE COMPONENTS — InfluenceAI Platform
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { influencersAPI, campaignsAPI, missionsAPI, agentsAPI, kycAPI, payoutsAPI, ragAPI, notificationsAPI } from '../api/client'
import { StatCard, Panel, Badge, Spinner, EmptyState, Avatar, FraudBadge, EngagementPill, PlatformIcon, ProgressBar, MultiSelectDropdown } from '../components/ui'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Upload, CheckCircle, XCircle, Eye, Play, Target, IndianRupee, Bell, IdCard, FolderArchive, Landmark, Hourglass, Mail, ClipboardList, Coins, Megaphone, Users, ShieldAlert, MessageSquare, Search, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'


// ─── Admin: Agent Console ─────────────────────────────────────────────────────

export function AdminAgents() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [running, setRunning] = useState(null)
  const [missions, setMissions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedMission, setSelectedMission] = useState('')
  const [assigning, setAssigning] = useState(null)
  const [showCreateMission, setShowCreateMission] = useState(false)
  const [creatingMission, setCreatingMission] = useState(false)
  const [missionForm, setMissionForm] = useState({ title: '', description: '', content_type: '', platforms: [], territory: '', reward_amount: '', deadline: '' })

  const loadData = () => {
    campaignsAPI.list().then(r => setCampaigns(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    missionsAPI.list().then(r => setMissions(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    missionsAPI.listAssignments().then(r => setAssignments(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  useEffect(() => { loadData() }, [])

  const createMission = async () => {
    if (!selectedCampaign) return toast.error('Select a campaign first')
    if (!missionForm.title.trim()) return toast.error('Mission title required')
    if (!missionForm.reward_amount) return toast.error('Reward amount required')
    setCreatingMission(true)
    try {
      await missionsAPI.create({
        campaign_id: parseInt(selectedCampaign),
        title: missionForm.title,
        description: missionForm.description,
        content_type: missionForm.content_type,
        platforms: missionForm.platforms.length > 0 ? missionForm.platforms : undefined,
        territory: missionForm.territory || undefined,
        reward_amount: parseFloat(missionForm.reward_amount),
        deadline: missionForm.deadline ? new Date(missionForm.deadline).toISOString() : undefined,
      })
      toast.success('Mission created!')
      setShowCreateMission(false)
      setMissionForm({ title: '', description: '', content_type: '', platforms: [], territory: '', reward_amount: '', deadline: '' })
      loadData()
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Failed to create mission')
    } finally { setCreatingMission(false) }
  }

  useEffect(() => {
    setSelectedMission('') // Fix: Reset selected mission when campaign changes
    if (!selectedCampaign) {
      setRecommendations([])
      return
    }
    let ignore = false
    setRunning('recommend')
    agentsAPI.recommend(selectedCampaign).then(res => {
      if (!ignore) {
        setRecommendations(res.data.recommendations || [])
        toast.success(`Found ${res.data.recommendations?.length || 0} matching influencers`)
      }
    }).catch(err => {
      if (!ignore) toast.error(err.response?.data?.detail || 'Failed to fetch recommendations')
    }).finally(() => {
      if (!ignore) setRunning(null)
    })
    return () => { ignore = true }
  }, [selectedCampaign])

  return (
    <div className="p-6">
      <div className="page-header"><h1 className="section-title">AI Agent Console</h1><Badge variant="green">All Agents Online</Badge></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { name: 'Recommendation Agent', icon: <Target className="w-6 h-6 text-accent-2" />, color: 'text-accent-2', desc: 'Matches influencers to campaigns using ML scoring' },
          { name: 'Chatbot Agent (RAG)', icon: <MessageSquare className="w-6 h-6 text-success" />, color: 'text-success', desc: 'AI-powered influencer support coach' },
          { name: 'Fraud Detection Agent', icon: <Search className="w-6 h-6 text-danger" />, color: 'text-danger', desc: 'Detects fake followers and suspicious activity' },
          { name: 'KYC Agent', icon: <IdCard className="w-6 h-6 text-warn" />, color: 'text-warn', desc: 'Handles document verification and SMTP alerts' },
        ].map(agent => (
          <div key={agent.name} className="card p-4">
            <div className="mb-2 flex items-center">{agent.icon}</div>
            <div className={`font-heading font-bold text-sm mb-1 ${agent.color}`}>{agent.name}</div>
            <div className="text-xs text-muted leading-relaxed">{agent.desc}</div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /> Running
            </div>
          </div>
        ))}
      </div>

      <Panel title="Select Campaign for Missions">
        <div className="p-5">
          <select className="input w-full" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
            <option value="">Select a campaign…</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Panel>

      {selectedCampaign && (
        <div className="mt-6">
          <Panel title="Campaign Missions">
            <div className="p-5">
              {!showCreateMission ? (
                <button 
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 mb-6" 
                  onClick={() => setShowCreateMission(true)}
                >
                  <Plus size={16} /> New Mission
                </button>
              ) : (
                <div className="bg-surface border border-divider rounded-xl p-5 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-sm">Mission Details</h3>
                    <button className="btn-ghost text-xs py-1" onClick={() => setShowCreateMission(false)}>Cancel</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-muted block mb-1">Mission Title *</label>
                      <input className="input w-full" placeholder="e.g. Post 1 Reel about our product" value={missionForm.title} onChange={e => setMissionForm(f => ({...f, title: e.target.value}))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted block mb-1">Description</label>
                      <textarea className="input w-full text-sm" rows={2} placeholder="Describe what the influencer should do…" value={missionForm.description} onChange={e => setMissionForm(f => ({...f, description: e.target.value}))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Content Type</label>
                      <select className="input w-full" value={missionForm.content_type} onChange={e => setMissionForm(f => ({...f, content_type: e.target.value}))}>
                        <option value="">Select type…</option>
                        <option value="reel">Reel</option>
                        <option value="post">Static Post</option>
                        <option value="story">Story</option>
                        <option value="video">Video</option>
                        <option value="review">Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Platform(s)</label>
                      <MultiSelectDropdown 
                        options={[
                          { value: 'instagram', label: 'Instagram' },
                          { value: 'youtube', label: 'YouTube' },
                          { value: 'facebook', label: 'Facebook' },
                        ]}
                        selected={missionForm.platforms}
                        onChange={(val) => setMissionForm(f => ({...f, platforms: val}))}
                        placeholder="Select Platforms..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Territory</label>
                      <input className="input w-full" placeholder="e.g. India, Mumbai, USA" value={missionForm.territory} onChange={e => setMissionForm(f => ({...f, territory: e.target.value}))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Reward (₹) *</label>
                      <input className="input w-full" type="number" placeholder="e.g. 5000" value={missionForm.reward_amount} onChange={e => setMissionForm(f => ({...f, reward_amount: e.target.value}))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Deadline</label>
                      <input className="input w-full" type="date" value={missionForm.deadline} onChange={e => setMissionForm(f => ({...f, deadline: e.target.value}))} />
                    </div>
                  </div>
                  <div className="mt-5">
                    <button className="btn-primary w-full flex items-center justify-center gap-2 py-2" onClick={createMission} disabled={creatingMission}>
                      {creatingMission ? <Spinner size={14} /> : <CheckCircle size={14} />} Create Mission
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-bold text-foreground mb-3">Existing Missions</div>
                {missions.filter(m => String(m.campaign_id) === String(selectedCampaign)).length > 0 ? (
                  <div className="space-y-2">
                    {missions.filter(m => String(m.campaign_id) === String(selectedCampaign)).map(m => (
                      <div key={m.id} className="flex items-center justify-between bg-surface border border-divider rounded-lg px-4 py-3">
                        <div>
                          <span className="font-semibold text-sm">{m.title}</span>
                          {m.content_type && <span className="text-xs text-muted ml-2 capitalize bg-white/5 px-2 py-0.5 rounded">· {m.content_type}</span>}
                        </div>
                        <span className="text-success text-sm font-bold">₹{m.reward_amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-surface/50 rounded-lg border border-dashed border-divider">
                    <span className="text-sm text-muted">No missions created for this campaign yet.</span>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {selectedCampaign && (
        <div className="mt-6">
          <Panel title="Recommendation Agent Results">
            <div className="p-5">
              {running === 'recommend' ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted">
                  <Spinner size={32} />
                  <div className="mt-4 text-sm font-medium">Finding best influencers for this campaign...</div>
                </div>
              ) : recommendations.length > 0 ? (
                <>
                  <div className="flex gap-3 mb-4 items-end bg-surface p-4 rounded-xl border border-divider shadow-sm">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-foreground mb-2 block uppercase tracking-wide">Select Mission to Assign:</label>
                      <select className="input w-full" value={selectedMission} onChange={e => setSelectedMission(e.target.value)}>
                        <option value="">Select a mission for this campaign...</option>
                        {missions.filter(m => String(m.campaign_id) === String(selectedCampaign)).map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Influencer</th><th>Score</th><th>Followers</th><th>Engagement</th><th>Niche</th><th>Reasons</th><th>Action</th></tr></thead>
                    <tbody>
                      {recommendations.map(r => (
                        <tr key={r.influencer_id}>
                          <td className="font-medium">{r.name}</td>
                          <td><span className={`font-sans font-bold ${r.score >= 70 ? 'text-success' : r.score >= 50 ? 'text-warn' : 'text-danger'}`}>{r.score}/100</span></td>
                          <td>{r.followers?.toLocaleString('en-IN') || '—'}</td>
                          <td><EngagementPill rate={r.engagement} /></td>
                          <td className="capitalize text-muted text-sm">{r.niche}</td>
                          <td className="text-xs text-muted">{r.reasons?.slice(0, 2).join(' · ')}</td>
                          <td>
                            {(() => {
                              const isAssigned = assignments.some(a => String(a.mission_id) === String(selectedMission) && String(a.influencer_id) === String(r.influencer_id));
                              return (
                                <button 
                                  className={`text-xs py-1 px-3 flex items-center justify-center gap-1 rounded-lg transition-colors font-medium ${isAssigned ? 'bg-surface text-muted border border-divider cursor-not-allowed' : 'btn-primary'}`}
                                  disabled={!selectedMission || assigning === r.influencer_id || isAssigned}
                                  onClick={async () => {
                                    setAssigning(r.influencer_id)
                                    try {
                                      await missionsAPI.assign(selectedMission, r.influencer_id)
                                      toast.success(`Mission assigned to ${r.name}!`)
                                      loadData() // refresh the assignments state
                                    } catch(err) {
                                      toast.error(err.response?.data?.detail || 'Assignment failed')
                                    } finally {
                                      setAssigning(null)
                                    }
                                  }}
                                >
                                  {assigning === r.influencer_id ? <Spinner size={12}/> : isAssigned ? <><CheckCircle size={12}/> Assigned</> : 'Assign'}
                                </button>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-center py-8 text-muted text-sm border border-dashed border-divider rounded-xl">
                  No recommended influencers found for this campaign.
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}

