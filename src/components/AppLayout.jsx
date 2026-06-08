import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../hooks/useAuthStore'
import {
  Bell, LogOut, ChevronDown, Sun, Moon,
  LayoutDashboard, Megaphone, Users, Bot, Search,
  TrendingUp, IdCard, Coins, BookOpen, Home,
  Target, MessageSquare, Link2, Trophy
} from 'lucide-react'
import { Avatar } from './ui'
import clsx from 'clsx'

const adminNav = [
  { section: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true },
    { to: '/admin/campaigns', label: 'Campaigns', icon: <Megaphone size={16} /> },
    { to: '/admin/influencers', label: 'Influencers', icon: <Users size={16} /> },
  ]},
  { section: 'AI Agents', items: [
    { to: '/admin/agents', label: 'Agent Console', icon: <Bot size={16} /> },
    { to: '/admin/fraud', label: 'Fraud Detection', icon: <Search size={16} /> },
    { to: '/admin/roi', label: 'ROI Predictor', icon: <TrendingUp size={16} /> },
  ]},
  { section: 'Operations', items: [
    { to: '/admin/missions', label: 'Mission Review', icon: <Target size={16} /> },
    { to: '/admin/kyc', label: 'KYC Review', icon: <IdCard size={16} /> },
    { to: '/admin/payouts', label: 'Payouts', icon: <Coins size={16} /> },
    { to: '/admin/rag', label: 'Knowledge Base', icon: <BookOpen size={16} /> },
  ]},
]

const influencerNav = [
  { section: 'My Hub', items: [
    { to: '/dashboard', label: 'My Dashboard', icon: <Home size={16} />, end: true },
    { to: '/dashboard/missions', label: 'Missions', icon: <Target size={16} /> },
    { to: '/dashboard/chat', label: 'AI Coach', icon: <MessageSquare size={16} /> },
    { to: '/dashboard/social', label: 'Social Accounts', icon: <Link2 size={16} /> },
  ]},
  { section: 'Profile', items: [
    { to: '/dashboard/kyc', label: 'KYC & Docs', icon: <IdCard size={16} /> },
    { to: '/dashboard/rewards', label: 'Rewards', icon: <Trophy size={16} /> },
    { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ]},
]

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuthStore()
  const nav = isAdmin() ? adminNav : influencerNav
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

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

  return (
    <div className="flex h-screen overflow-hidden text-text">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-bg-2 border-r border-border transition-colors duration-200">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <div className="font-heading text-lg font-extrabold text-text">
            Influence<span className="text-accent-2">AI</span>
          </div>
          <div className="text-xs text-muted mt-0.5">
            {isAdmin() ? 'Admin Console' : 'Creator Hub'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {nav.map((section) => (
            <div key={section.section}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted px-3 mb-2">
                {section.section}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                     key={item.to}
                     to={item.to}
                     end={item.end}
                     className={({ isActive }) =>
                       clsx('nav-item', isActive && 'active')
                     }
                   >
                     <span className="text-base">{item.icon}</span>
                     <span>{item.label}</span>
                   </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user?.full_name || ''} size={8} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-text">{user?.full_name}</div>
              <div className="text-xs text-muted capitalize">{user?.role}</div>
            </div>
            <button onClick={toggleTheme} className="text-muted hover:text-accent transition-colors" title="Toggle Theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={logout} className="text-muted hover:text-danger transition-colors" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
