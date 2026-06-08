// ─── Admin: Knowledge Base ────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import api, { ragAPI } from '../api/client'
import { Panel, Spinner, EmptyState, ProgressBar } from '../components/ui'
import toast from 'react-hot-toast'
import {
  UploadCloud, FileText, Plus, XCircle, CheckCircle,
  FolderArchive, Search, Sparkles, AlertTriangle, RefreshCw
} from 'lucide-react'

const CATEGORIES = ['brand_playbook', 'faq', 'product', 'campaign_rules', 'policy', 'platform_guide']

const CATEGORY_MAP = {
  brand_playbook: 'Brand Playbook',
  faq: 'FAQ',
  product: 'Product Info',
  campaign_rules: 'Campaign Rules',
  policy: 'Policy',
  platform_guide: 'Platform Guide',
}

const categoryColor = {
  brand_playbook: 'text-accent-2',
  faq: 'text-success',
  product: 'text-info',
  campaign_rules: 'text-warn',
  policy: 'text-danger',
  platform_guide: 'text-muted',
}

function formatCategory(cat) {
  return CATEGORY_MAP[cat] || cat?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || cat
}

// Score colour thresholds
function scoreColor(score) {
  if (score >= 75) return { bar: 'bg-success', text: 'text-success', bg: 'bg-success/10 border-success/20' }
  if (score >= 45) return { bar: 'bg-warn',    text: 'text-warn',    bg: 'bg-warn/10 border-warn/20' }
  return               { bar: 'bg-danger',     text: 'text-danger',  bg: 'bg-danger/10 border-danger/20' }
}

export function AdminRAG() {
  const [docs, setDocs]               = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [deleting, setDeleting]       = useState(null)

  // Text-paste form
  const [textForm, setTextForm]   = useState({ title: '', content: '', category: 'brand_playbook' })
  const [addingText, setAddingText] = useState(false)

  // File upload — 3 states: 'idle' | 'analysing' | 'preview'
  const [fileStage, setFileStage]       = useState('idle')      // 'idle' | 'analysing' | 'preview'
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview]           = useState(null)        // analysis result from /rag/preview
  const [indexing, setIndexing]         = useState(false)

  // Search
  const [searchQ, setSearchQ] = useState('')
  const [results, setResults] = useState([])

  // Tab
  const [addTab, setAddTab] = useState('file')

  const loadDocs = async () => {
    setLoadingDocs(true)
    try {
      const docsRes = await ragAPI.listDocs()
      setDocs(Array.isArray(docsRes.data?.documents) ? docsRes.data.documents : [])
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => { loadDocs() }, [])

  // ── Reset file selection ────────────────────────────────────────────────────
  const resetFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setFileStage('idle')
    const el = document.getElementById('rag-file-input')
    if (el) el.value = ''
  }

  // ── Step 1: Analyse (POST /rag/preview) ────────────────────────────────────
  const analyseFile = async () => {
    if (!selectedFile) return
    setFileStage('analysing')
    try {
      const form = new FormData()
      form.append('file', selectedFile)
      const res = await api.post('/rag/preview', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreview(res.data)
      setFileStage('preview')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
      setFileStage('idle')
    }
  }

  // ── Step 2: Confirm (POST /rag/upload) ─────────────────────────────────────
  const confirmUpload = async () => {
    if (!preview) return
    setIndexing(true)
    try {
      await api.post('/rag/upload', {
        title:          preview.title,
        category:       preview.category,
        extracted_text: preview.extracted_text,
        source_file:    preview.source_file,
      })
      toast.success(`"${preview.title}" indexed into Knowledge Base!`)
      resetFile()
      await loadDocs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Indexing failed')
    } finally {
      setIndexing(false)
    }
  }

  // ── Add text doc ────────────────────────────────────────────────────────────
  const addTextDoc = async () => {
    if (!textForm.title.trim() || !textForm.content.trim())
      return toast.error('Title and content required')
    setAddingText(true)
    try {
      await ragAPI.addDoc(textForm)
      toast.success('Document added to Knowledge Base!')
      setTextForm(f => ({ ...f, title: '', content: '' }))
      await loadDocs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally { setAddingText(false) }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteDoc = async (docId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(docId)
    try {
      await ragAPI.deleteDoc(docId)
      toast.success('Document deleted')
      await loadDocs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally { setDeleting(null) }
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  const search = async () => {
    if (!searchQ.trim()) return
    try {
      const r = await ragAPI.search(searchQ)
      setResults(r.data.results || [])
    } catch { toast.error('Search failed') }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="page-header">
        <div>
          <h1 className="section-title">Knowledge Base</h1>
          <p className="text-muted text-sm mt-1">
            Documents used by the AI Coach to answer influencer questions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* ── Left: Add Document ── */}
        <Panel title="Add Document">
          {/* Tabs */}
          <div className="flex border-b border-border px-5">
            {[
              { key: 'file', icon: <UploadCloud size={14} />, label: 'Upload File',  desc: 'PDF / DOCX / TXT' },
              { key: 'text', icon: <FileText    size={14} />, label: 'Paste Text',   desc: 'Manual entry' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => { setAddTab(t.key); resetFile() }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                  addTab === t.key
                    ? 'border-accent text-accent font-semibold'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                <span className="text-xs text-muted font-normal ml-1.5">{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">

            {/* ══ FILE TAB ══ */}
            {addTab === 'file' && (
              <>
                {/* ── idle: dropzone ── */}
                {fileStage === 'idle' && (
                  <div className="space-y-4">
                    {!selectedFile ? (
                      <label className="relative group flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-accent hover:bg-accent/[0.02] rounded-xl p-8 cursor-pointer transition-all duration-300 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-accent-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <input
                          id="rag-file-input"
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <div className="w-12 h-12 rounded-full bg-accent-bg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                          <UploadCloud size={20} className="text-accent group-hover:animate-bounce" />
                        </div>
                        <div className="text-sm font-semibold text-text mb-1">
                          Click to select PDF, DOCX, or TXT
                        </div>
                        <div className="text-xs text-muted max-w-[240px] mx-auto leading-normal">
                          AI will auto-generate title, category & relevance score
                        </div>
                        <div className="mt-4 flex gap-1.5 justify-center">
                          {['.PDF', '.DOCX', '.TXT'].map(ext => (
                            <span key={ext} className="text-[10px] bg-highlight border border-border px-2 py-0.5 rounded font-mono text-muted">{ext}</span>
                          ))}
                        </div>
                      </label>
                    ) : (
                      /* file chosen — ready to analyse */
                      <div className="border border-success/30 bg-success/5 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className={
                            selectedFile.name.endsWith('.pdf')  ? 'text-danger' :
                            selectedFile.name.endsWith('.docx') ? 'text-info'   : 'text-accent'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-text truncate">{selectedFile.name}</div>
                          <div className="text-xs text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button
                          onClick={resetFile}
                          className="w-8 h-8 rounded-full hover:bg-danger-bg text-muted hover:text-danger flex items-center justify-center transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}

                    <button
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      onClick={analyseFile}
                      disabled={!selectedFile}
                    >
                      <Sparkles size={14} />
                      Analyse Document
                    </button>
                  </div>
                )}

                {/* ── analysing: spinner ── */}
                {fileStage === 'analysing' && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                      <Sparkles size={22} className="text-accent animate-pulse" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-text mb-1">Analysing document…</div>
                      <div className="text-xs text-muted">AI is reading content and scoring relevance</div>
                    </div>
                    <Spinner />
                  </div>
                )}

                {/* ── preview: analysis result ── */}
                {fileStage === 'preview' && preview && (() => {
                  const sc = scoreColor(preview.score)
                  return (
                    <div className="space-y-4">
                      {/* Score header */}
                      <div className={`rounded-xl border p-4 ${sc.bg}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {preview.score >= 45
                              ? <CheckCircle size={16} className={sc.text} />
                              : <AlertTriangle size={16} className={sc.text} />
                            }
                            <span className={`text-sm font-bold ${sc.text}`}>{preview.verdict}</span>
                          </div>
                          <span className={`text-2xl font-black ${sc.text}`}>{preview.score}<span className="text-xs font-medium opacity-60">/100</span></span>
                        </div>
                        <ProgressBar value={preview.score} color={sc.bar} height="h-1.5" />
                      </div>

                      {/* Summary + Reason */}
                      <div className="bg-highlight rounded-xl p-4 space-y-2 border border-border">
                        <p className="text-xs text-text leading-relaxed">{preview.summary}</p>
                        <p className="text-xs text-muted italic">{preview.reason}</p>
                      </div>

                      {/* Editable Title */}
                      <div>
                        <label className="text-xs text-muted block mb-1">Title <span className="text-muted/50">(auto-generated, editable)</span></label>
                        <input
                          className="input w-full"
                          value={preview.title}
                          onChange={e => setPreview(p => ({ ...p, title: e.target.value }))}
                        />
                      </div>

                      {/* Editable Category */}
                      <div>
                        <label className="text-xs text-muted block mb-1">Category <span className="text-muted/50">(auto-detected, editable)</span></label>
                        <select
                          className="input w-full"
                          value={preview.category}
                          onChange={e => setPreview(p => ({ ...p, category: e.target.value }))}
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{formatCategory(c)}</option>
                          ))}
                        </select>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><FileText size={11} />{preview.source_file}</span>
                        <span>·</span>
                        <span>{preview.word_count?.toLocaleString()} words</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
                          onClick={resetFile}
                        >
                          <RefreshCw size={13} />
                          Change File
                        </button>
                        <button
                          className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                          onClick={confirmUpload}
                          disabled={indexing}
                        >
                          {indexing ? <Spinner size={13} /> : <CheckCircle size={13} />}
                          {indexing ? 'Indexing…' : 'Add to Knowledge Base'}
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </>
            )}

            {/* ══ TEXT TAB ══ */}
            {addTab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted block mb-1">Title *</label>
                  <input
                    className="input w-full"
                    placeholder="e.g. Refund Policy"
                    value={textForm.title}
                    onChange={e => setTextForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Category *</label>
                  <select
                    className="input w-full"
                    value={textForm.category}
                    onChange={e => setTextForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Content *</label>
                  <textarea
                    className="input w-full text-sm"
                    rows={7}
                    value={textForm.content}
                    onChange={e => setTextForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Paste brand guidelines, FAQs, product info, campaign rules…"
                  />
                </div>
                <button
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={addTextDoc}
                  disabled={addingText || !textForm.title.trim() || !textForm.content.trim()}
                >
                  {addingText ? <Spinner size={14} /> : <Plus size={14} />}
                  Add to Knowledge Base
                </button>
              </div>
            )}
          </div>
        </Panel>

        {/* ── Right: Semantic Search ── */}
        <Panel title="Semantic Search">
          <div className="p-5">
            <div className="flex gap-2 mb-4">
              <input
                className="input flex-1"
                placeholder="e.g. how to submit a mission, payout timeline…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button className="btn-primary px-5" onClick={search}>Search</button>
            </div>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm">{r.title}</div>
                    <span className={`text-xs font-medium ${categoryColor[r.category] || 'text-muted'}`}>
                      {formatCategory(r.category)}
                    </span>
                  </div>
                  <div className="text-xs text-white/60 leading-relaxed">{r.excerpt}…</div>
                </div>
              ))}
              {results.length === 0 && searchQ && (
                <div className="text-muted text-sm text-center py-6">No results found</div>
              )}
              {results.length === 0 && !searchQ && (
                <div className="text-muted text-sm text-center py-6 text-muted/50">
                  Type a question to search the knowledge base
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* ── Documents List ── */}
      <Panel title={`Indexed Documents (${docs.length})`}>
        {loadingDocs ? (
          <div className="flex items-center justify-center h-32"><Spinner /></div>
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<FolderArchive className="w-12 h-12 text-muted" />}
            title="No documents yet"
            description="Upload a PDF/DOCX or paste text above to add your first document."
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Excerpt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td className="font-medium text-sm max-w-[200px] truncate">{doc.title}</td>
                  <td>
                    <span className={`text-xs font-medium ${categoryColor[doc.category] || 'text-muted'}`}>
                      {formatCategory(doc.category)}
                    </span>
                  </td>
                  <td className="text-xs text-muted max-w-xs truncate">{doc.excerpt}</td>
                  <td>
                    <button
                      className="flex items-center gap-1.5 text-xs bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger px-3 py-1.5 rounded-lg transition-colors"
                      onClick={() => deleteDoc(doc.id, doc.title)}
                      disabled={deleting === doc.id}
                    >
                      {deleting === doc.id ? <Spinner size={11} /> : <XCircle size={12} />}
                      Delete
                    </button>
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