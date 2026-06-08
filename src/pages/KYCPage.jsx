// ═══════════════════════════════════════════════════════
// ALL PAGE COMPONENTS — InfluenceAI Platform
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { influencersAPI, campaignsAPI, missionsAPI, agentsAPI, kycAPI, payoutsAPI, ragAPI, notificationsAPI } from '../api/client'
import { StatCard, Panel, Badge, Spinner, EmptyState, Avatar, FraudBadge, EngagementPill, PlatformIcon, ProgressBar } from '../components/ui'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Upload, CheckCircle, XCircle, Eye, Play, Target, IndianRupee, Bell, IdCard, FolderArchive, Landmark, Hourglass, Mail, ClipboardList, Coins, Megaphone, Users, ShieldAlert, MessageSquare, Search, Lock, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'


// ─── Influencer: KYC ─────────────────────────────────────────────────────────

export function KYCPage() {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(null)
  const [loading, setLoading] = useState(true)

  // Two-step upload: choose file → enter password → submit.
  // pendingUpload: { docType, file }
  const [pendingUpload, setPendingUpload] = useState(null)
  const [password, setPassword] = useState('')

  // We keep refs to each <input type="file"> so we can reset them after the
  // user cancels the password modal without re-uploading.
  const fileRefs = useRef({})

  const load = async () => {
    try { const res = await kycAPI.list(); setDocs(res.data || []) } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  // Step 1: user picks a file. We stash it and prompt for the password
  // instead of uploading immediately — the backend needs the password to
  // derive the encryption key.
  const handleFilePicked = (docType, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingUpload({ docType, file })
    setPassword('')
  }

  // Step 2: send file + password to the backend.
  const confirmUpload = async () => {
    if (!password) return toast.error('Enter your account password')
    if (!pendingUpload) return
    const { docType, file } = pendingUpload
    setUploading(docType)
    try {
      await kycAPI.upload(docType, file, password)
      toast.success(`${docType} uploaded for review`)
      setPendingUpload(null)
      setPassword('')
      // Reset the underlying file input so the same filename can be re-selected later.
      if (fileRefs.current[docType]) fileRefs.current[docType].value = ''
      await load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const cancelUpload = () => {
    if (pendingUpload && fileRefs.current[pendingUpload.docType]) {
      fileRefs.current[pendingUpload.docType].value = ''
    }
    setPendingUpload(null)
    setPassword('')
  }

  const DOC_TYPES = [
    { id: 'aadhaar', label: 'Aadhaar Card', desc: 'Front and back', icon: <IdCard className="w-8 h-8 text-accent-2 mx-auto" /> },
    { id: 'pan', label: 'PAN Card', desc: 'Tax identification', icon: <FolderArchive className="w-8 h-8 text-accent-2 mx-auto" /> },
    { id: 'bank_statement', label: 'Bank Statement / Cheque', desc: 'Last 3 months or cancelled cheque', icon: <Landmark className="w-8 h-8 text-accent-2 mx-auto" /> },
  ]

  // Remove full page loader, we will show loaders on the buttons themselves

  return (
    <div className="p-6">
      <div className="page-header">
        <h1 className="section-title">KYC & Documents</h1>
      </div>

      {/* Password prompt modal — appears after the user picks a file. */}
      {pendingUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-accent" />
              <h3 className="font-heading font-bold">Encrypt & Upload</h3>
            </div>
            <p className="text-muted text-xs mb-4 leading-relaxed">
              For your protection, KYC documents are encrypted before being stored.
              Please re-enter your account password — it's used to derive the
              encryption key and is never saved.
            </p>
            <div className="mb-3 text-xs bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-muted">{pendingUpload.docType}</span>
              <span className="text-text truncate ml-3">{pendingUpload.file?.name}</span>
            </div>
            <label className="text-xs text-muted block mb-1.5">Your account password</label>
            <input
              type="password"
              className="input w-full mb-4 text-sm"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmUpload() }}
              placeholder="••••••••"
            />
            <div className="flex gap-3">
              <button
                className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-2"
                onClick={confirmUpload}
                disabled={uploading === pendingUpload.docType}
              >
                {uploading === pendingUpload.docType ? (
                  <><Spinner size={13} className="text-white" /> Uploading...</>
                ) : (
                  <><Upload size={14} /> Encrypt & Upload</>
                )}
              </button>
              <button className="btn-ghost flex-1 text-sm" onClick={cancelUpload}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {DOC_TYPES.map(dt => {
          const doc = docs.find(d => d.doc_type === dt.id)
          const isRejected = doc?.status === 'rejected'
          return (
            <div key={dt.id} className="card p-5 flex flex-col items-center text-center">
              <div className="mb-3 flex justify-center">{dt.icon}</div>
              <div className="font-heading font-bold text-sm mb-1">{dt.label}</div>
              <div className="text-xs text-muted mb-4">{dt.desc}</div>

              {/* Hidden file input — clicking the label triggers it. We keep
                  one per doc_type so the password-modal cancel path can reset it. */}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={el => { if (el) fileRefs.current[dt.id] = el }}
                onChange={e => handleFilePicked(dt.id, e)}
              />

              {loading ? (
                <button type="button" disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70 cursor-not-allowed">
                  <Spinner size={14} className="text-white" /> Loading...
                </button>
              ) : doc ? (
                <div className="w-full">
                  <div className={`badge mb-2 flex items-center justify-center gap-1 ${doc.status === 'approved' ? 'badge-green' : isRejected ? 'badge-red' : 'badge-amber'}`}>
                    {doc.status === 'approved' ? (
                      <><CheckCircle size={12} /> Verified</>
                    ) : isRejected ? (
                      <><XCircle size={12} /> Rejected</>
                    ) : (
                      <>Pending</>
                    )}
                  </div>

                  {/* Show rejection reason + date so the influencer knows
                      what to fix before re-uploading. */}
                  {isRejected && (
                    <div className="text-left bg-danger/10 border border-danger/30 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-danger font-bold mb-1">
                        <AlertCircle size={11} /> Reason for rejection
                      </div>
                      <div className="text-xs text-text leading-relaxed mb-1.5">
                        {doc.rejection_reason || 'No reason provided.'}
                      </div>
                      {doc.rejected_at && (
                        <div className="text-[10px] text-muted">
                          Rejected on {new Date(doc.rejected_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {isRejected && (
                    <label
                      htmlFor={`file-${dt.id}`}
                      onClick={() => { if (uploading !== dt.id) fileRefs.current[dt.id]?.click() }}
                      className={`btn-primary w-full text-xs py-2 flex items-center justify-center gap-1 mt-2 cursor-pointer ${uploading === dt.id ? 'opacity-70' : ''}`}
                    >
                      {uploading === dt.id ? <Spinner size={12} className="text-white" /> : <Upload size={12} />} Re-upload {dt.label}
                    </label>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRefs.current[dt.id]?.click()}
                  disabled={uploading === dt.id}
                  className={`btn-primary w-full flex items-center justify-center gap-2 cursor-pointer ${uploading === dt.id ? 'opacity-70' : ''}`}
                >
                  {uploading === dt.id ? <Spinner size={14} className="text-white" /> : <Upload size={14} />}
                  Upload {dt.label}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-4 rounded-xl text-xs text-info border flex items-start gap-2.5" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info-border)' }}>
        <Mail size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          Your documents are encrypted at rest using a key derived from your password,
          and you'll receive email notifications when they're approved or need
          resubmission. KYC must be fully approved before payouts can be processed.
        </div>
      </div>
    </div>
  )
}
