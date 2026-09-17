import { motion } from 'framer-motion'
import { useLayoutEffect, useState, type RefObject } from 'react'
import { CHANNELS, type ChannelId } from '../../data/content'
import { useStore } from '../../store/scenarioStore'

interface P {
  id: ChannelId
  d: string
}

/** Glowing green routes fanning out from the failed Mobile Data card to every other channel. */
export function FailoverLines({ container, cards }: { container: RefObject<HTMLDivElement | null>; cards: RefObject<Partial<Record<ChannelId, HTMLDivElement | null>>> }) {
  const phase = useStore((s) => s.failoverPhase)
  const channels = useStore((s) => s.channels)
  const [paths, setPaths] = useState<P[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = container.current
    if (!el) return
    const measure = () => {
      const base = el.getBoundingClientRect()
      const src = cards.current?.data?.getBoundingClientRect()
      if (!src) return
      setSize({ w: base.width, h: base.height })
      const sx = src.right - base.left - 6
      const sy = src.top - base.top + src.height / 2
      const out: P[] = []
      CHANNELS.filter((c) => c.id !== 'data').forEach((c) => {
        const r = cards.current?.[c.id]?.getBoundingClientRect()
        if (!r) return
        const tx = r.left - base.left + r.width / 2
        const ty = r.top - base.top + (r.top - base.top < sy ? r.height - 6 : 6)
        const mx = sx + (tx - sx) * 0.35
        out.push({ id: c.id, d: `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}` })
      })
      setPaths(out)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const t = window.setTimeout(measure, 600)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [container, cards, phase])

  if (phase < 3) return null

  return (
    <svg className="pointer-events-none absolute inset-0 z-20" width={size.w} height={size.h}>
      <defs>
        <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F87171" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#4ADE80" />
          <stop offset="1" stopColor="#86EFAC" />
        </linearGradient>
        <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((p, i) => {
        const on = channels[p.id].state === 'operational'
        return (
          <g key={p.id} filter="url(#route-glow)">
            <motion.path
              d={p.d}
              fill="none"
              stroke="url(#route-grad)"
              strokeWidth={on ? 2.6 : 1.4}
              strokeOpacity={on ? 0.95 : 0.45}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
            />
            {on && (
              <path d={p.d} fill="none" stroke="#DCFCE7" strokeWidth="2.2" strokeDasharray="6 34" strokeLinecap="round" className="dash-flow" style={{ animationDuration: `${0.9 + (i % 3) * 0.2}s` }} />
            )}
            {on && (
              <circle r="3.5" fill="#BBF7D0">
                <animateMotion dur={`${1.4 + (i % 4) * 0.2}s`} repeatCount="indefinite" path={p.d} />
              </circle>
            )}
          </g>
        )
      })}
    </svg>
  )
}
