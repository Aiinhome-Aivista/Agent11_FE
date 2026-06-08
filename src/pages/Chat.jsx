import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { chatAPI } from '../api/client'
import useAuthStore from '../hooks/useAuthStore'
import { Send, Bot, Lightbulb, Hash, Megaphone, IndianRupee, IdCard, BarChart3, HelpCircle, Instagram, Youtube, Facebook, ShieldAlert, FileText, Upload, BookOpen } from 'lucide-react'

const ICON_MAP = {
  Lightbulb: Lightbulb,
  Hash: Hash,
  Megaphone: Megaphone,
  IndianRupee: IndianRupee,
  IdCard: IdCard,
  BarChart3: BarChart3,
  HelpCircle: HelpCircle,
}
import { Spinner, Avatar } from '../components/ui'
import toast from 'react-hot-toast'

const randId = () => Math.random().toString(36).slice(2)

const QUICK_ASKS = [
  { text: 'What content should I post today?', icon: 'Lightbulb' },
  { text: 'Suggest hashtags for my niche', icon: 'Hash' },
  { text: 'What campaigns am I eligible for?', icon: 'Megaphone' },
  { text: 'When will I get paid?', icon: 'IndianRupee' },
  { text: 'How does KYC work?', icon: 'IdCard' },
  { text: 'How is engagement rate calculated?', icon: 'BarChart3' },
]

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center flex-shrink-0 animate-pulse">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-bg-3 border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI Coach, powered by advanced context retrieval. I have brand guidelines, campaign rules, and FAQ knowledge at my fingertips. What can I help you with today?`,
      sources: [],
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => randId())
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    // Build conversation history for context
    const history = messages.slice(-6).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }))

    try {
      const res = await chatAPI.send(msg, history, sessionId)
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data.response,
        sources: res.data.sources || [],
        rag_docs: res.data.rag_docs_used || 0,
      }])
    } catch (err) {
      toast.error('Chat failed. Check API key configurations in backend .env')
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ I could not connect to the AI model. Please ensure the required API keys are configured in the backend `.env` file.',
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex">
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-bg-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <div className="font-heading font-bold text-sm">InfluenceAI Coach</div>
            <div className="text-xs text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
              AI Knowledge Assistant
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
              ) : (
                <Avatar name={user?.full_name || ''} size={8} bgClass="bg-gradient-to-br from-success to-info" textClass="text-black" />
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-bg-3 border border-border rounded-tl-sm text-text markdown-body'
                    : 'bg-accent text-white rounded-tr-sm'
                }`}>
                  {msg.role === 'ai' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < msg.content.split('\n').length - 1 ? <br/> : ''}</span>
                    ))
                  )}
                </div>
                {msg.sources?.length > 0 && (
                  <div className="text-[10px] text-muted flex flex-wrap gap-1">
                    <BookOpen size={10} className="inline mr-1 align-middle" /> Sources: {msg.sources.slice(0, 2).map(s => (
                      <span key={s} className="bg-highlight px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {msg.rag_docs > 0 && <span className="text-accent-2">{msg.rag_docs} docs used</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick asks */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {QUICK_ASKS.map(q => {
            const IconComp = ICON_MAP[q.icon] || HelpCircle
            return (
              <button key={q.text} onClick={() => send(q.text)} className="text-xs bg-highlight hover:bg-highlight/80 border border-border rounded-full px-3 py-1.5 text-muted hover:text-text transition-colors flex items-center gap-1.5">
                <IconComp size={12} className="text-accent-2" />
                {q.text}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <div className="px-6 pb-6 border-t border-border pt-4">
          <div className="flex gap-3">
            <textarea
              className="input flex-1 resize-none text-sm"
              rows={1}
              placeholder="Ask your AI Coach…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            />
            <button
              className="btn-primary px-4 flex items-center gap-2 self-end"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              {loading ? <Spinner size={14} /> : <Send size={14} />}
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge base sidebar */}
      <div className="w-64 border-l border-border bg-bg-2 p-4 overflow-y-auto hidden lg:block">
        <div className="font-heading font-bold text-xs uppercase tracking-wider text-muted mb-4">RAG Knowledge Base</div>
        {[
          { icon: <Instagram size={14} className="text-pink-500" />, name: 'Instagram Best Practices', cat: 'Platform Guide' },
          { icon: <Youtube size={14} className="text-red-500" />, name: 'YouTube Campaign Strategy', cat: 'Platform Guide' },
          { icon: <Facebook size={14} className="text-blue-600" />, name: 'Facebook Page Guidelines', cat: 'Platform Guide' },
          { icon: <IdCard size={14} className="text-warn" />, name: 'KYC Process & Requirements', cat: 'FAQ' },
          { icon: <IndianRupee size={14} className="text-success" />, name: 'Payout Policy & Timeline', cat: 'FAQ' },
          { icon: <ShieldAlert size={14} className="text-danger" />, name: 'Fraud & Authenticity Policy', cat: 'Policy' },
          { icon: <FileText size={14} className="text-accent" />, name: 'Content Creation Guidelines', cat: 'Brand Playbook' },
          { icon: <Upload size={14} className="text-info" />, name: 'Mission Submission Guide', cat: 'FAQ' },
        ].map(doc => (
          <div key={doc.name} className="bg-highlight rounded-lg p-3 mb-2">
            <div className="text-xs font-semibold text-accent-2 mb-0.5 flex items-center gap-1.5">
              {doc.icon} <span>{doc.name}</span>
            </div>
            <div className="text-[10px] text-muted">{doc.cat}</div>
          </div>
        ))}
        <div className="mt-4 bg-success/5 border border-success/20 rounded-lg p-3 text-[10px] text-success">
          Add custom documents via Admin → Knowledge Base
        </div>
      </div>
    </div>
  )
}
