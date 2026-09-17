import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { LiveTag } from './LiveTag'

interface Props {
  title?: string
  icon?: LucideIcon
  right?: ReactNode
  live?: boolean
  brackets?: boolean
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function GlassPanel({ title, icon: Icon, right, live, brackets = true, className = '', bodyClassName = '', children }: Props) {
  return (
    <section className={`glass brackets rounded-xl flex flex-col min-h-0 ${className}`}>
      {brackets && (
        <>
          <span className="bk tl" />
          <span className="bk tr" />
          <span className="bk bl" />
          <span className="bk br" />
        </>
      )}
      {title && (
        <header className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-sky-400/10">
          {Icon && <Icon size={14} className="text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />}
          <h3 className="label truncate">{title}</h3>
          {live && <LiveTag />}
          <div className="ml-auto flex items-center gap-2">{right}</div>
        </header>
      )}
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
