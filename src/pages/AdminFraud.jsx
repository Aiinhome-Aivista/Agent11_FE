// ═══════════════════════════════════════════════════════
// ALL PAGE COMPONENTS — InfluenceAI Platform
// ═══════════════════════════════════════════════════════

import { useState, useEffect, Fragment } from 'react'
import { influencersAPI, campaignsAPI, missionsAPI, agentsAPI, kycAPI, payoutsAPI, ragAPI, notificationsAPI } from '../api/client'
import { StatCard, Panel, Badge, Spinner, EmptyState, Avatar, FraudBadge, EngagementPill, PlatformIcon, ProgressBar } from '../components/ui'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Upload, CheckCircle, XCircle, Eye, Play, Target, IndianRupee, Bell, IdCard, FolderArchive, Landmark, Hourglass, Mail, ClipboardList, Coins, Megaphone, Users, ShieldAlert, MessageSquare, Search, Bot, AlertTriangle, X, Lightbulb } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'


// ─── Admin: Fraud Detection ───────────────────────────────────────────────────

export function AdminFraud() {
  const [influencers, setInfluencers] = useState([])
  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    influencersAPI.list({ limit: 50 }).then(r => setInfluencers(Array.isArray(r.data?.influencers) ? r.data.influencers : [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader-backdrop"><Spinner size={32} /></div>

  const runCheck = async (id) => {
    setChecking(id); setResult(null)
    try {
      const res = await agentsAPI.fraud(id)
      setResult({ ...res.data, influencer_id: id })
      toast.success('Fraud analysis complete')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') } finally { setChecking(null) }
  }

  const formatVerdict = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i, arr) => (
      <Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
          part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong> : part
        )}
        {i < arr.length - 1 && <br />}
      </Fragment>
    ))
  }

  const totalScanned = influencers.length
  const highRiskCount = influencers.filter(i => i.fraud_score > 60).length
  const avgScore = influencers.length > 0 ? Math.round(influencers.reduce((acc, i) => acc + (i.fraud_score || 0), 0) / influencers.length) : 0
  
  const highRisk = influencers.filter(i => i.fraud_score > 60).sort((a,b) => b.fraud_score - a.fraud_score)
  const safe = influencers.filter(i => i.fraud_score <= 60).sort((a,b) => b.fraud_score - a.fraud_score)

  const renderRow = (inf) => (
    <Fragment key={inf.id}>
      <tr style={inf.fraud_score > 60 ? { backgroundColor: 'var(--danger-bg)' } : null}>
        <td><div className="flex items-center gap-2"><Avatar name={inf.full_name} size={7} /><span className="text-sm">{inf.full_name}</span></div></td>
        <td>{inf.total_followers?.toLocaleString('en-IN') || '—'}</td>
        <td><EngagementPill rate={inf.avg_engagement_rate} /></td>
        <td><Badge variant={inf.kyc_status === 'approved' ? 'green' : 'amber'}>{inf.kyc_status}</Badge></td>
        <td className="w-36"><FraudBadge score={inf.fraud_score} /></td>
        <td>
          {result?.influencer_id === inf.id ? (
            <button className="btn-ghost p-1.5 flex items-center justify-center text-muted" onClick={() => setResult(null)} title="Close">
              <X size={16} />
            </button>
          ) : (
            <button className="btn-ghost p-1.5 flex items-center justify-center" onClick={() => runCheck(inf.id)} disabled={checking === inf.id} title="Analyse">
              {checking === inf.id ? <Spinner size={14} /> : <Lightbulb size={16} />}
            </button>
          )}
        </td>
      </tr>
      {result?.influencer_id === inf.id && (
        <tr>
          <td colSpan="6" className="p-0 border-0 bg-transparent">
            <div className={`mx-2 mb-2 p-3 rounded-lg border-l-4 ${result.risk_level === 'high' ? 'border-danger' : result.risk_level === 'medium' ? 'border-warn' : 'border-success'}`} style={{ backgroundColor: 'var(--card-bg, var(--bg))', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`text-xl font-sans font-bold ${result.risk_level === 'high' ? 'text-danger' : result.risk_level === 'medium' ? 'text-warn' : 'text-success'}`}>
                  {result.fraud_score}/100
                </div>
                <div>
                  <div className="font-bold text-sm capitalize">{result.risk_level} Risk</div>
                  <div className="text-xs text-muted">{result.recommendation}</div>
                </div>
              </div>
              {result.flags?.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] text-muted mb-1">Flags detected:</div>
                  {result.flags.map(f => (
                    <div key={f} className="text-xs text-warn rounded px-2 py-1 flex items-center gap-1" style={{ backgroundColor: 'var(--warn-bg)' }}>
                      <AlertTriangle size={12} /> {f}
                    </div>
                  ))}
                </div>
              )}
              {result.ai_verdict && (
                <div className="bg-highlight rounded-lg p-2.5 text-xs text-muted leading-relaxed flex gap-2">
                  <Bot size={16} className="shrink-0 mt-0.5 text-primary" />
                  <div>
                    <strong className="text-foreground block">AI Security Analysis:</strong>
                    <div className="mt-0.5">{formatVerdict(result.ai_verdict)}</div>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  )

  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title">AI Fraud Detection Dashboard</h1>
          <p className="text-sm text-muted mt-1">Monitor influencer risk profiles and run AI-powered fraud analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4 border-l-2 border-accent">
          <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center"><Users size={20} /></div>
          <div><div className="text-2xl font-bold text-foreground">{totalScanned}</div><div className="text-[10px] text-muted font-bold tracking-wider uppercase mt-0.5">Monitored Accounts</div></div>
        </div>
        <div className={`card p-4 flex items-center gap-4 border-l-2 ${highRiskCount > 0 ? 'border-danger bg-danger/5' : 'border-success'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${highRiskCount > 0 ? 'bg-danger/20 text-danger' : 'bg-success/10 text-success'}`}>
            <ShieldAlert size={20} />
          </div>
          <div><div className={`text-2xl font-bold ${highRiskCount > 0 ? 'text-danger' : 'text-success'}`}>{highRiskCount}</div><div className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${highRiskCount > 0 ? 'text-danger' : 'text-success'}`}>High-Risk Alerts</div></div>
        </div>
        <div className="card p-4 flex items-center gap-4 border-l-2 border-warn">
          <div className="w-10 h-10 rounded-full bg-warn/10 text-warn flex items-center justify-center"><AlertTriangle size={20} /></div>
          <div><div className="text-2xl font-bold text-foreground">{avgScore}/100</div><div className="text-[10px] text-muted font-bold tracking-wider uppercase mt-0.5">Avg System Risk</div></div>
        </div>
      </div>

      <Panel>
        <table className="tbl">
          <thead><tr><th>Influencer</th><th>Followers</th><th>Engagement</th><th>KYC</th><th>Fraud Score</th><th>Action</th></tr></thead>
          <tbody>
            {highRisk.length > 0 && (
              <tr><td colSpan={6} className="bg-danger/10 text-xs font-bold text-danger uppercase px-4 py-2.5 tracking-wider border-y border-danger/20">Critical Alerts ({highRisk.length})</td></tr>
            )}
            {highRisk.map(renderRow)}
            
            {safe.length > 0 && (
              <tr><td colSpan={6} className="bg-surface text-xs font-bold text-muted uppercase px-4 py-2.5 tracking-wider border-y border-divider">Safe & Pending ({safe.length})</td></tr>
            )}
            {safe.map(renderRow)}

            {influencers.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-10">No influencers monitored yet</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}

