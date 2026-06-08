import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, Bot, Shield, TrendingUp, Users, ArrowRight,
  CheckCircle2, MessageSquare, Play, Landmark, Coins,
  IdCard, ChevronRight, Zap, Menu, X, Target, Sun, Moon
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [calculatorBudget, setCalculatorBudget] = useState(5000)
  const [calculatorPlatform, setCalculatorPlatform] = useState('instagram')
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Simple calculator formula for interactive wow-factor
  const getEstimatedReach = () => (calculatorBudget * 3.5).toLocaleString('en-IN')
  const getEstimatedROI = () => {
    const multi = calculatorPlatform === 'instagram' ? 3.8 : calculatorPlatform === 'youtube' ? 4.2 : 2.9
    return (calculatorBudget * multi).toLocaleString('en-IN')
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-200 overflow-x-hidden selection:bg-accent selection:text-white relative">
      {/* Background glowing blobs (very subtle in light theme, glowing in dark theme) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 dark:bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-accent-2/5 dark:bg-accent-2/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[350px] h-[350px] bg-success/5 dark:bg-success/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="border-b border-border backdrop-blur-md sticky top-0 z-40 bg-bg/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading text-xl font-extrabold tracking-tight flex items-center gap-2">
              Influence<span className="text-accent">AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
              <a href="#agents" className="hover:text-text transition-colors">AI Agents</a>
              <a href="#features" className="hover:text-text transition-colors">Platform</a>
              <a href="#calculator" className="hover:text-text transition-colors">ROI Calculator</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg border border-border bg-card text-muted hover:text-text transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link to="/login" className="text-sm font-medium hover:text-accent transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20 py-2 px-4">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg border border-border bg-card text-muted hover:text-text transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-text hover:text-accent">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-bg px-6 py-4 space-y-4 transition-colors duration-200">
          <a href="#agents" onClick={() => setMobileMenuOpen(false)} className="block text-muted hover:text-text">AI Agents</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-muted hover:text-text">Platform</a>
          <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block text-muted hover:text-text">ROI Calculator</a>
          <hr className="border-border" />
          <div className="flex flex-col gap-3">
            <Link to="/login" className="text-center py-2 text-sm text-muted">Sign In</Link>
            <Link to="/register" className="btn-primary text-center py-2.5 text-sm flex items-center justify-center gap-2">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-bg border border-accent/20 text-xs font-semibold text-accent">
            <Sparkles size={12} className="animate-pulse" />
            <span>Introducing Agentic Creator Marketing</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto text-text">
            Automate Campaign Matchmaking with <span className="bg-gradient-to-r from-accent via-accent to-accent-2 bg-clip-text text-transparent">AI Agents</span>
          </h1>

          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The next-generation creator intelligence platform. Spot bot accounts, forecast real ROI, automate payouts, and chat with a dedicated RAG-powered campaign coach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button onClick={() => navigate('/register')} className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
              Launch Campaign <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost w-full sm:w-auto px-8 py-3.5 text-base flex items-center justify-center gap-2">
              Explore Creator Hub
            </button>
          </div>
        </div>

        {/* Floating Mockup Preview */}
        <div className="max-w-6xl mx-auto px-6 mt-16 md:mt-24">
          <div className="card p-2 bg-card border-border shadow-2xl relative group rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="bg-bg-2 rounded-xl border border-border overflow-hidden shadow-inner transition-colors duration-200">
              {/* Fake app chrome header */}
              <div className="flex items-center justify-between px-4 py-3 bg-bg border-b border-border transition-colors duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-warn/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-success/50" />
                </div>
                <div className="text-[10px] text-muted font-mono tracking-widest uppercase">InfluenceAI - Agent Console</div>
                <div className="w-12 h-2 rounded bg-border" />
              </div>

              {/* Fake dashboard contents */}
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {/* Left col: Agent Selector */}
                <div className="space-y-4 md:border-r border-border md:pr-5">
                  <div className="text-xs font-bold text-accent uppercase tracking-widest">Active Agents</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Recommendation Agent', status: 'Optimal Match', color: 'text-accent', active: true },
                      { name: 'Fraud Check Guard', status: 'Monitoring API', color: 'text-danger' },
                      { name: 'RAG Knowledge Coach', status: 'Sync complete', color: 'text-success' },
                    ].map(a => (
                      <div key={a.name} className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${a.active ? 'bg-accent-bg border-accent/25 text-accent-2 font-medium' : 'bg-card border-border hover:bg-bg-3'}`}>
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-success animate-pulse" /> {a.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center col: Recommendations list */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-text uppercase tracking-widest">Campaign Matching Recommendations</div>
                    <div className="text-[10px] bg-success-bg text-success px-2 py-0.5 rounded-full font-semibold">99.2% Accuracy</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Aditi Sharma', followers: '840K', engagement: '4.8%', score: '94/100', match: 'High Niche Fit' },
                      { name: 'Rahul Varma', followers: '1.2M', engagement: '5.2%', score: '89/100', match: 'Top ROI Predictor' },
                      { name: 'Priya Nair', followers: '250K', engagement: '6.1%', score: '82/100', match: 'Micro Influencer' },
                    ].map((rec, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-accent/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-bg text-accent flex items-center justify-center font-bold text-xs">{rec.name[0]}</div>
                          <div>
                            <div className="text-xs font-semibold">{rec.name}</div>
                            <div className="text-[10px] text-muted">{rec.followers} Followers · {rec.engagement} Engagement</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-success font-sans font-bold">{rec.score}</div>
                          <div className="text-[9px] text-muted capitalize">{rec.match}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-20 border-t border-border relative bg-bg-2/30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-text">Meet Your Agentic Workforce</h2>
            <p className="text-muted text-sm md:text-base">Four fully-autonomous agents dedicated to optimizing creator workflows, verifying documents, and checking logs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: 'Matchmaking Agent',
                desc: 'Scans target audiences and matches creator profiles to campaigns using ML scoring metrics.',
                icon: <Target className="w-6 h-6 text-accent" />,
                badge: 'Match Agent'
              },
              {
                title: 'RAG Knowledge Coach',
                desc: 'Uses advanced retrieval models to digest playbooks and answer creator support queries in real time.',
                icon: <MessageSquare className="w-6 h-6 text-success" />,
                badge: 'Knowledge Agent'
              },
              {
                title: 'Fraud Detection Guard',
                desc: 'Audits accounts to flag artificial followers, bot engagement metrics, and payout tampering.',
                icon: <Shield className="w-6 h-6 text-danger" />,
                badge: 'Security Agent'
              },
              {
                title: 'Automated Operations',
                desc: 'Processes one-click escrow transactions, generates reports, and checks automated KYC reviews.',
                icon: <IdCard className="w-6 h-6 text-warn" />,
                badge: 'Operations Agent'
              }
            ].map(a => (
              <div key={a.title} className="card p-6 bg-card hover:bg-bg-2 hover:border-accent/20 border-border transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {a.icon}
                </div>
                <div className="inline-block text-[10px] uppercase font-bold text-accent mb-2 tracking-widest">{a.badge}</div>
                <h3 className="font-heading font-bold text-base text-text mb-2">{a.title}</h3>
                <p className="text-muted text-xs leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" className="py-20 border-t border-border transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-heading font-extrabold text-text">Predict Campaign Impact</h2>
              <p className="text-muted text-sm leading-relaxed">
                Adjust the sliding budget to see the projected audience reach and predicted return on investment. Our agent matches this directly using historical campaigns data.
              </p>

              <div className="space-y-4 pt-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>Campaign Budget</span>
                    <span className="text-accent">₹{calculatorBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range" min="1000" max="50000" step="500"
                    value={calculatorBudget} onChange={e => setCalculatorBudget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-2">Primary Target Platform</label>
                  <div className="flex gap-2">
                    {['instagram', 'youtube', 'facebook'].map(p => (
                      <button
                        key={p} onClick={() => setCalculatorPlatform(p)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs capitalize transition-all ${calculatorPlatform === p ? 'bg-accent-bg border-accent text-accent font-semibold' : 'bg-card border-border text-muted hover:border-border-default'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-card border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl pointer-events-none" />
              <div className="text-xs font-bold uppercase tracking-widest text-muted mb-6">Predicted ROI Output</div>
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-muted mb-1">Estimated Audience Reach</div>
                  <div className="text-2xl font-sans font-bold text-text flex items-baseline gap-1">
                    {getEstimatedReach()} <span className="text-xs text-muted font-normal">users</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Forecast Payout Value / Return</div>
                  <div className="text-4xl font-sans font-extrabold text-success flex items-baseline gap-1">
                    ₹{getEstimatedROI()} <span className="text-xs text-muted font-normal">INR</span>
                  </div>
                </div>
                <div className="p-3 bg-bg-2 border border-border rounded-lg flex items-start gap-2.5 text-[10px] text-muted leading-relaxed">
                  <Zap size={14} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Calculations resolved by Recommendation Agent based on standard {calculatorPlatform} CPM and engagement levels.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 border-t border-border bg-bg-2/20 relative transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-text">Ready to automate your creator workflow?</h2>
          <p className="text-muted text-sm max-w-xl mx-auto">Create a campaign or set up your creator profile document credentials to sync immediately.</p>
          <div className="pt-4 flex justify-center gap-3">
            <button onClick={() => navigate('/register')} className="btn-primary px-8 py-3 text-sm flex items-center gap-2 shadow-lg shadow-accent/20">
              Get Started Now <ArrowRight size={14} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost px-8 py-3 text-sm">
              Creator Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-bg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-heading font-bold text-text">InfluenceAI</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted">
            <a href="#agents" className="hover:text-text">AI Agents</a>
            <a href="#features" className="hover:text-text">API Status</a>
            <a href="#calculator" className="hover:text-text">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
