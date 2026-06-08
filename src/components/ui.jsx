import { Loader2, Inbox, Instagram, Youtube, Facebook, Globe, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

export function Spinner({ size = 20, className = 'text-accent' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />
}

export function StatCard({ label, value, delta, deltaUp, color = 'text-text', icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted font-semibold">{label}</span>
        {icon && <span className="text-2xl flex items-center justify-center">{icon}</span>}
      </div>
      <div className={clsx('font-sans text-3xl font-bold leading-none mb-1', color)}>{value}</div>
      {delta && (
        <div className={clsx('text-xs flex items-center gap-1', deltaUp ? 'text-success' : 'text-danger')}>
          {deltaUp ? '▲' : '▼'} {delta}
        </div>
      )}
    </div>
  )
}

export function Badge({ children, variant = 'purple' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function Panel({ title, children, action, className = '' }) {
  return (
    <div className={clsx('card', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-heading font-bold text-sm text-text">{title}</span>
          {action}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ icon = <Inbox className="w-12 h-12 text-muted" />, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <div className="font-heading font-bold text-base mb-1 text-text">{title}</div>
      <div className="text-muted text-sm">{description}</div>
    </div>
  )
}

export function Avatar({ name = '', size = 8, bgClass = 'bg-gradient-to-br from-accent to-accent-2', textClass = 'text-white' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const dimension = `${size * 0.25}rem`
  const textSz = size >= 12 ? 'text-sm' : size >= 8 ? 'text-xs' : 'text-[10px]'
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={clsx('rounded-full flex items-center justify-center font-bold font-heading flex-shrink-0', textSz, bgClass, textClass)}
    >
      {initials}
    </div>
  )
}

export function PlatformIcon({ platform }) {
  const configs = {
    instagram: {
      icon: <Instagram size={18} />,
      bg: 'bg-pink-500/10 border-pink-500/20 text-pink-500 hover:bg-pink-500/20'
    },
    youtube: {
      icon: <Youtube size={18} />,
      bg: 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
    },
    facebook: {
      icon: <Facebook size={18} />,
      bg: 'bg-blue-600/10 border-blue-600/20 text-blue-600 hover:bg-blue-600/20'
    }
  }
  const conf = configs[platform] || {
    icon: <Globe size={18} />,
    bg: 'bg-white/5 border-white/10 text-muted'
  }
  return (
    <div
      className={clsx(
        'w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-sm',
        conf.bg
      )}
      title={platform}
    >
      {conf.icon}
    </div>
  )
}

export function ProgressBar({ value = 0, color = 'bg-accent', height = 'h-1.5' }) {
  return (
    <div className={clsx('w-full bg-highlight rounded-full overflow-hidden', height)}>
      <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function FraudBadge({ score }) {
  const level = score > 60 ? 'red' : score > 30 ? 'amber' : 'green'
  const label = score > 60 ? 'High Risk' : score > 30 ? 'Medium' : 'Clean'
  return (
    <div className="flex items-center gap-2">
      <ProgressBar
        value={score}
        color={score > 60 ? 'bg-danger' : score > 30 ? 'bg-warn' : 'bg-success'}
        height="h-1"
      />
      <span className={`text-xs font-semibold ${score > 60 ? 'text-danger' : score > 30 ? 'text-warn' : 'text-success'}`}>
        {score}
      </span>
    </div>
  )
}

export function EngagementPill({ rate }) {
  const color = rate >= 5 ? 'text-success' : rate >= 2 ? 'text-warn' : 'text-danger'
  return <span className={clsx('font-semibold text-sm', color)}>{rate?.toFixed(1)}%</span>
}

export const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="input w-full flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-sm">
          {selected.length > 0
            ? options.filter(o => selected.includes(o.value)).map(o => o.label).join(", ")
            : placeholder}
        </span>
        <ChevronDown size={16} className="text-muted" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2.5 hover:bg-highlight cursor-pointer flex items-center gap-3 transition-colors"
              onClick={() => toggleOption(option.value)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => {}}
                className="w-4 h-4 rounded border-border bg-transparent text-accent focus:ring-accent"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

