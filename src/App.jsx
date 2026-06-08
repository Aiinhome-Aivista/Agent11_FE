import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './hooks/useAuthStore'
import AppLayout from './components/AppLayout'
import { agentsAPI, campaignsAPI } from './api/client'
import { Spinner } from './components/ui'
import { TrendingUp } from 'lucide-react'

import { LoginPage, RegisterPage } from './pages/Auth'
import SocialAccountsPage from './pages/SocialAccounts'
import ChatPage from './pages/Chat'
import LandingPage from './pages/Landing'
import { InfluencerDashboard } from './pages/InfluencerDashboard'
import { MissionsPage } from './pages/MissionsPage'
import { KYCPage } from './pages/KYCPage'
import { RewardsPage } from './pages/RewardsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminInfluencers } from './pages/AdminInfluencers'
import { AdminCampaigns } from './pages/AdminCampaigns'
import { AdminMissions } from './pages/AdminMissions'
import { AdminAgents } from './pages/AdminAgents'
import { AdminFraud } from './pages/AdminFraud'
import { AdminKYC } from './pages/AdminKYC'
import { AdminPayouts } from './pages/AdminPayouts'
import { AdminRAG } from './pages/AdminRAG'

function RequireInfluencer({ children }) {
  const { isInfluencer, isLoggedIn } = useAuthStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!isInfluencer()) return <Navigate to="/admin" replace />
  return children
}

function RequireAdmin({ children }) {
  const { isAdmin, isLoggedIn } = useAuthStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

function AdminROIPage() {
  const [campaigns, setCampaigns] = useState([])
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    campaignsAPI.list().then(r => setCampaigns(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) {
      setResult(null)
      return
    }
    let ignore = false
    setLoading(true)
    agentsAPI.roi(selected).then(r => {
      if (!ignore) setResult(r.data)
    }).catch(e => console.error(e)).finally(() => {
      if (!ignore) setLoading(false)
    })
    return () => { ignore = true }
  }, [selected])

  return (
    <div className="p-6">
      <div className="page-header"><h1 className="section-title">ROI Predictor</h1></div>
      
      <div className="card p-6 mb-6">
        <select className="input w-full text-lg p-3 cursor-pointer" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select a campaign to predict ROI…</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} — ₹{c.budget?.toLocaleString('en-IN')}</option>)}
        </select>
      </div>

      {loading && (
        <div className="card p-12 flex flex-col items-center justify-center text-muted">
          <Spinner size={32} />
          <div className="mt-4 text-sm font-medium">Analyzing campaign metrics...</div>
        </div>
      )}

      {!result && !loading && (
        <div className="card p-16 flex items-center justify-center">
          <div className="text-center text-muted">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No Campaign Selected</h3>
            <p className="text-sm">Choose a campaign from the dropdown above to view AI-powered ROI predictions.</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <div className="bg-success/10 border border-success/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="text-sm font-bold text-success mb-2 uppercase tracking-widest">Predicted ROI</div>
            <div className="text-7xl font-sans font-extrabold text-success tracking-tight">
              {result.predicted_roi > 0 ? '+' : ''}{result.predicted_roi}%
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              ['Est. Revenue', `₹${result.estimated_revenue?.toLocaleString('en-IN')}`],
              ['Total Reach', result.total_reach?.toLocaleString('en-IN')],
              ['Impressions', result.estimated_impressions?.toLocaleString('en-IN')],
              ['Conversions', result.estimated_conversions],
              ['Engagement', `${result.avg_engagement}%`],
              ['Confidence', result.confidence],
            ].map(([label, value]) => (
              <div key={label} className="card p-5 border border-border shadow-sm flex flex-col justify-center text-center">
                <div className="text-xs text-muted mb-2 font-medium uppercase tracking-wide">{label}</div>
                <div className="font-semibold text-xl text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <div className="card p-6 border border-border shadow-sm">
            <div className="text-sm font-bold text-foreground mb-5 uppercase tracking-wide">Analysis & Reasoning</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.reasoning?.map((r, i) => (
                <div key={i} className="flex gap-3 items-start bg-surface p-4 rounded-xl">
                  <div className="text-accent mt-0.5 shrink-0"><TrendingUp size={18} /></div>
                  <div className="text-sm text-muted leading-relaxed">{r}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--card)',
          color: 'var(--text-default)',
          border: '1px solid var(--border-default)',
          fontSize: '13px',
          borderRadius: '10px',
          transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        },
        success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--card)' } },
        error:   { iconTheme: { primary: 'var(--danger)', secondary: 'var(--card)' } },
      }} />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/"         element={<LandingPage />} />

        <Route path="/dashboard" element={<RequireInfluencer><AppLayout /></RequireInfluencer>}>
          <Route index                element={<InfluencerDashboard />} />
          <Route path="missions"      element={<MissionsPage />} />
          <Route path="chat"          element={<ChatPage />} />
          <Route path="social"        element={<SocialAccountsPage />} />
          <Route path="kyc"           element={<KYCPage />} />
          <Route path="rewards"       element={<RewardsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="/admin" element={<RequireAdmin><AppLayout /></RequireAdmin>}>
          <Route index                element={<AdminDashboard />} />
          <Route path="campaigns"     element={<AdminCampaigns />} />
          <Route path="missions"      element={<AdminMissions />} />
          <Route path="influencers"   element={<AdminInfluencers />} />
          <Route path="agents"        element={<AdminAgents />} />
          <Route path="fraud"         element={<AdminFraud />} />
          <Route path="roi"           element={<AdminROIPage />} />
          <Route path="kyc"           element={<AdminKYC />} />
          <Route path="payouts"       element={<AdminPayouts />} />
          <Route path="rag"           element={<AdminRAG />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
