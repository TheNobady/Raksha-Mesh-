import { motion } from 'framer-motion'
import { useId } from 'react'

interface Opt<T extends string> {
  id: T
  label: string
  color?: string
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: { options: Opt<T>[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md' | 'lg' }) {
  const layoutId = useId()
  const pad = size === 'lg' ? 'py-3 text-sm' : size === 'sm' ? 'py-1 text-[11px]' : 'py-1.5 text-xs'
  return (
    <div className="relative flex rounded-lg border border-sky-400/15 bg-slate-950/50 p-1">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`relative flex-1 rounded-md font-hud font-bold uppercase tracking-widest cursor-pointer transition-colors ${pad} ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md"
                style={{
                  background: `${o.color ?? '#22D3EE'}33`,
                  boxShadow: `0 0 0 1px ${o.color ?? '#22D3EE'}AA, 0 0 18px ${o.color ?? '#22D3EE'}66`,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative" style={active && o.color ? { color: o.color, textShadow: `0 0 10px ${o.color}` } : undefined}>
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
