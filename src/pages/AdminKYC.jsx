// ═══════════════════════════════════════════════════════
// ALL PAGE COMPONENTS — InfluenceAI Platform
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { influencersAPI, campaignsAPI, missionsAPI, agentsAPI, kycAPI, payoutsAPI, ragAPI, notificationsAPI } from '../api/client'
import { StatCard, Panel, Badge, Spinner, EmptyState, Avatar, FraudBadge, EngagementPill, PlatformIcon, ProgressBar } from '../components/ui'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, Upload, CheckCircle, XCircle, Eye, Play, Target, IndianRupee, Bell, IdCard, FolderArchive, Landmark, Hourglass, Mail, ClipboardList, Coins, Megaphone, Users, ShieldAlert, MessageSquare, Search, CreditCard, Lock, FileText, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'


// ─── Admin: KYC Review ────────────────────────────────────────────────────────

export function AdminKYC() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [acting, setActing] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 })

  // View flow state. Step 1: admin clicks "View Document" and gets a
  // password prompt (passwordModal). Step 2: backend returns decrypted
  // bytes which we render in viewerModal.
  const [passwordModal, setPasswordModal] = useState(null)  // { docId, userName, docType }
  const [viewPassword, setViewPassword] = useState('')
  const [viewLoading, setViewLoading] = useState(false)
  const [viewerModal, setViewerModal] = useState(null)      // { mime, dataUrl, filename, userName, docType }

  const loadStats = async () => {
    try {
      const res = await kycAPI.stats()
      if (res && res.data) setStats(res.data)
    } catch (err) { console.error('Failed to load KYC stats:', err) }
  }

  const load = async (status) => {
    setLoading(true)
    try {
      const res = await kycAPI.adminAll(status)
      const rawDocs = Array.isArray(res.data) ? res.data : []
      const sorted = [...rawDocs].sort((a, b) => {
        const priority = { pending: 1, approved: 2, rejected: 3 }
        const pA = priority[a.status] || 4
        const pB = priority[b.status] || 4
        if (pA !== pB) return pA - pB
        return new Date(b.uploaded_at) - new Date(a.uploaded_at)
      })
      setDocs(sorted)
      await loadStats()
    } catch (err) {
      toast.error('Failed to load KYC documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(filter) }, [filter])

  const approve = async (docId) => {
    setActing(docId)
    try {
      await kycAPI.approve(docId)
      toast.success('Document approved. Email sent to influencer.')
      await load(filter)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Approval failed')
    } finally { setActing(null) }
  }

  const openReject = (doc) => {
    setRejectModal({ docId: doc.id, userName: doc.user_name })
    setRejectReason('')
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a rejection reason')
    setActing(rejectModal.docId)
    try {
      await kycAPI.reject(rejectModal.docId, rejectReason)
      toast.success('Document rejected. Influencer notified.')
      setRejectModal(null)
      await load(filter)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Rejection failed')
    } finally { setActing(null) }
  }

  // Two-step viewing: prompt for the influencer's password, then fetch the
  // decrypted document and render it inline.
  const openViewPrompt = (doc) => {
    setPasswordModal({ docId: doc.id, userName: doc.user_name, docType: doc.doc_type })
    setViewPassword('')
  }

  const confirmView = async () => {
    if (!viewPassword) return toast.error("Enter the influencer's password")
    setViewLoading(true)
    try {
      const res = await kycAPI.view(passwordModal.docId, viewPassword)
      const { mime_type, content_base64, filename } = res.data
      const dataUrl = `data:${mime_type};base64,${content_base64}`
      setViewerModal({
        mime: mime_type,
        dataUrl,
        filename,
        userName: passwordModal.userName,
        docType: passwordModal.docType,
      })
      setPasswordModal(null)
      setViewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not decrypt document')
    } finally {
      setViewLoading(false)
    }
  }

  const docTypeLabel = {
    aadhaar: { icon: <IdCard size={14} className="text-accent" />, label: 'Aadhaar' },
    pan: { icon: <CreditCard size={14} className="text-warn" />, label: 'PAN Card' },
    bank_statement: { icon: <Landmark size={14} className="text-success" />, label: 'Bank Statement' }
  }
  const pending = stats.pending

  return (
    <div className="p-6">
      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md mx-4">
            <h3 className="font-heading font-bold mb-1">Reject Document</h3>
            <p className="text-muted text-sm mb-4">
              Rejecting for <span className="text-white font-medium">{rejectModal.userName}</span>. They will be notified via email and can re-upload.
            </p>
            <label className="text-xs text-muted block mb-1.5">Rejection Reason *</label>
            <textarea
              className="input w-full mb-4 text-sm"
              rows={3}
              placeholder="e.g. Document is blurry, name mismatch, expired ID…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                className="flex-1 bg-danger/20 hover:bg-danger/30 border border-danger/40 text-danger rounded-xl py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                onClick={confirmReject}
                disabled={acting === rejectModal.docId}
              >
                {acting === rejectModal.docId ? <Spinner size={13} /> : <XCircle size={14} />}
                Confirm Reject
              </button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password prompt before showing the document */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-accent" />
              <h3 className="font-heading font-bold">Influencer Password Required</h3>
            </div>
            <p className="text-muted text-xs mb-4 leading-relaxed">
              Documents are encrypted at rest. Enter <span className="text-white font-medium">{passwordModal.userName}</span>'s account
              password to decrypt and view this {passwordModal.docType.replace('_', ' ')}.
              The password is verified server-side and is not stored.
            </p>
            <label className="text-xs text-muted block mb-1.5">Password</label>
            <input
              type="password"
              autoFocus
              className="input w-full mb-4 text-sm"
              value={viewPassword}
              onChange={e => setViewPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmView() }}
              placeholder="••••••••"
            />
            <div className="flex gap-3">
              <button
                className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-2"
                onClick={confirmView}
                disabled={viewLoading}
              >
                {viewLoading ? <Spinner size={13} /> : <Eye size={14} />}
                Decrypt & View
              </button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => { setPasswordModal(null); setViewPassword('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Decrypted document viewer */}
      {viewerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-4xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-accent" />
                  <span className="font-heading font-bold text-sm">{viewerModal.userName}</span>
                  <span className="text-muted text-xs">•</span>
                  <span className="text-xs text-muted capitalize">{viewerModal.docType.replace('_', ' ')}</span>
                </div>
                <div className="text-[10px] text-muted mt-0.5">{viewerModal.filename}</div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewerModal.dataUrl}
                  download={viewerModal.filename}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  Download
                </a>
                <button className="btn-ghost p-2 rounded-full" onClick={() => setViewerModal(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center p-4">
              {viewerModal.mime?.startsWith('image/') ? (
                <img src={viewerModal.dataUrl} alt={viewerModal.filename} className="max-w-full max-h-full object-contain" />
              ) : viewerModal.mime === 'application/pdf' ? (
                <iframe src={viewerModal.dataUrl} title={viewerModal.filename} className="w-full h-full bg-white rounded" />
              ) : (
                <div className="text-muted text-sm">Cannot preview this file type. Use Download.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="section-title">KYC Review</h1>
          <p className="text-muted text-sm mt-1">
            {pending > 0
              ? <span className="text-warn font-medium">{pending} documents awaiting review</span>
              : 'All documents reviewed'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Pending" value={stats.pending} icon={<Hourglass size={20} className="text-warn" />} color="text-warn" />
        <StatCard label="Approved" value={stats.approved} icon={<CheckCircle size={20} className="text-success" />} color="text-success" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={20} className="text-danger" />} color="text-danger" />
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { key: 'pending', icon: <Hourglass size={12} />, label: 'Pending' },
          { key: 'approved', icon: <CheckCircle size={12} />, label: 'Approved' },
          { key: 'rejected', icon: <XCircle size={12} />, label: 'Rejected' },
          { key: '', icon: <ClipboardList size={12} />, label: 'All' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm px-4 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              filter === f.key
                ? 'bg-accent/20 border-accent text-accent font-semibold'
                : 'border-white/10 text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
          </button>
        ))}
        <button className="ml-auto btn-ghost text-xs flex items-center gap-1.5" onClick={() => load(filter)}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <Panel>
        {loading ? (
          <div className="flex items-center justify-center h-48"><Spinner /></div>
        ) : docs.length === 0 ? (
          <EmptyState icon={<IdCard className="w-12 h-12 text-muted" />} title="No documents found" description={`No ${filter || ''} KYC documents.`} />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Influencer</th>
                <th>Document</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th>Rejection Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className={doc.status === 'pending' ? 'bg-warn/[0.03]' : ''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={doc.user_name} size={7} />
                      <div>
                        <div className="text-sm font-medium">{doc.user_name}</div>
                        <div className="text-xs text-muted">{doc.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm flex items-center gap-2">
                      {docTypeLabel[doc.doc_type] ? (
                        <>
                          {docTypeLabel[doc.doc_type].icon}
                          <span>{docTypeLabel[doc.doc_type].label}</span>
                        </>
                      ) : (
                        doc.doc_type
                      )}
                    </span>
                  </td>
                  <td className="text-xs text-muted">{new Date(doc.uploaded_at).toLocaleString()}</td>
                  <td>
                    <Badge variant={doc.status === 'approved' ? 'green' : doc.status === 'rejected' ? 'red' : 'amber'}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="text-xs text-muted max-w-xs">
                    {doc.rejection_reason ? (
                      <div>
                        <div>{doc.rejection_reason}</div>
                        {doc.rejected_at && (
                          <div className="text-[10px] text-muted/70 mt-0.5">{new Date(doc.rejected_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="flex items-center gap-1.5 text-xs bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => openViewPrompt(doc)}
                      >
                        <Lock size={11} /> View Document
                      </button>
                      {doc.status === 'pending' && (
                        <>
                          <button
                            className="flex items-center gap-1.5 text-xs bg-success/15 hover:bg-success/25 border border-success/30 text-success px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => approve(doc.id)}
                            disabled={acting === doc.id}
                          >
                            {acting === doc.id ? <Spinner size={11} /> : <CheckCircle size={12} />} Approve
                          </button>
                          <button
                            className="flex items-center gap-1.5 text-xs bg-danger/15 hover:bg-danger/25 border border-danger/30 text-danger px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => openReject(doc)}
                            disabled={acting === doc.id}
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      )}
                      {doc.status === 'approved' && (
                        <span className="text-xs text-success self-center">✓ Verified {doc.verified_at ? new Date(doc.verified_at).toLocaleDateString() : ''}</span>
                      )}
                      {doc.status === 'rejected' && (
                        <button className="text-xs text-muted hover:text-white underline self-center" onClick={() => openReject(doc)}>
                          Update reason
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  )
}
