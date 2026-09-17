import type { LucideIcon } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'

const TONES = {
  cyan: 'border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/15 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] bg-cyan-400/5',
  red: 'border-red-400/50 text-red-200 hover:bg-red-500/20 hover:shadow-[0_0_24px_rgba(239,68,68,0.45)] bg-red-500/10',
  amber: 'border-amber-400/50 text-amber-200 hover:bg-amber-400/15 hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] bg-amber-400/5',
  green: 'border-green-400/50 text-green-200 hover:bg-green-400/15 hover:shadow-[0_0_24px_rgba(74,222,128,0.4)] bg-green-400/5',
  rose: 'border-rose-400/60 text-rose-100 hover:bg-rose-500/25 hover:shadow-[0_0_28px_rgba(244,63,94,0.5)] bg-rose-500/15',
  ghost: 'border-sky-400/15 text-slate-300 hover:bg-sky-400/10 bg-transparent',
}

interface Props {
  icon?: LucideIcon
  tone?: keyof typeof TONES
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
  children?: ReactNode
  title?: string
}

export function GlowButton({ icon: Icon, tone = 'cyan', size = 'md', className = '', onClick, disabled, children, title }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    window.setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 650)
    onClick?.()
  }
  const sz = size === 'sm' ? 'px-2.5 py-1.5 text-[11px] gap-1.5' : size === 'lg' ? 'px-5 py-3 text-sm gap-2.5' : 'px-3.5 py-2 text-xs gap-2'
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={handle}
      className={`relative overflow-hidden inline-flex items-center justify-center rounded-lg border font-hud font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${TONES[tone]} ${sz} ${className}`}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, animation: 'ripple 0.65s ease-out forwards' }}
        />
      ))}
      {Icon && <Icon size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  )
}
