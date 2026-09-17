import { AnimatePresence, motion } from 'framer-motion'
import { AlertOctagon, AlertTriangle, CheckCircle2, ChevronsLeft, ChevronsRight, Info, ScrollText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useStore, type FeedEvent } from '../../store/scenarioStore'
import { LiveTag } from '../ui/LiveTag'

const SEV = {
  info: { icon: Info, c: 'text-cyan-300' },
  ok: { icon: CheckCircle2, c: 'text-green-400' },
  warn: { icon: AlertTriangle, c: 'text-amber-300' },
  crit: { icon: AlertOctagon, c: 'text-red-400' },
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'crit', label: 'Critical' },
  { id: 'channel', label: 'Channels' },
  { id: 'rescue', label: 'Rescue' },
] as const

export function EventFeed() {
  const feed = useStore((s) => s.feed)
  const open = useStore((s) => s.feedOpen)
  const set = useStore((s) => s.set)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [hover, setHover] = useState(false)
  const [frozen, setFrozen] = useState<FeedEvent[] | null>(null)

  const source = hover && frozen ? frozen : feed
  const list = useMemo(
    () =>
      source
        .filter((e) => (filter === 'all' ? true : filter === 'crit' ? e.sev === 'crit' : e.cat === filter))
        .slice(0, 60),
    [source, filter],
  )

  if (!open) {
    return (
      <aside className="relative z-20 flex w-11 shrink-0 flex-col items-center gap-3 border-l border-sky-400/10 bg-[#060f20]/80 py-3">
        <button onClick={() => set({ feedOpen: true })} className="text-cyan-300 cursor-pointer" title="Open event feed">
          <ChevronsLeft size={18} />
        </button>
        <ScrollText size={16} className="text-slate-500" />
        <span className="font-hud text-[10px] uppercase tracking-[0.3em] text-slate-500 [writing-mode:vertical-rl]">Live Event Feed</span>
      </aside>
    )
  }

  return (
    <aside className="relative z-20 flex w-[270px] min-[1600px]:w-[320px] shrink-0 flex-col border-l border-sky-400/10 bg-[#060f20]/85 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <ScrollText size={14} className="text-cyan-300" />
        <span className="label">Live Event Feed</span>
        <LiveTag />
        <button onClick={() => set({ feedOpen: false })} className="ml-auto text-slate-500 hover:text-cyan-300 cursor-pointer" title="Collapse">
          <ChevronsRight size={16} />
        </button>
      </div>
      <div className="flex gap-1 px-3 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-md border px-2 py-0.5 font-hud text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${filter === f.id ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-100' : 'border-sky-400/10 text-slate-400 hover:text-slate-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div
        className="thin-scroll relative flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2"
        onMouseEnter={() => {
          setFrozen(feed)
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
          setFrozen(null)
        }}
      >
        {hover && <div className="sticky top-0 z-10 mb-1 rounded bg-slate-900/90 py-0.5 text-center font-mono text-[10px] text-amber-300">⏸ paused while hovering</div>}
        <AnimatePresence initial={false}>
          {list.map((e) => {
            const s = SEV[e.sev]
            const Icon = s.icon
            return (
              <motion.div
                key={e.id}
                layout="position"
                initial={{ opacity: 0, x: 24, backgroundColor: 'rgba(34,211,238,0.22)' }}
                animate={{ opacity: 1, x: 0, backgroundColor: e.sev === 'crit' ? 'rgba(239,68,68,0.07)' : 'rgba(0,0,0,0)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, backgroundColor: { duration: 1.4 } }}
                className={`mb-1 flex gap-2 rounded-md px-2 py-1.5 ${e.sev === 'crit' ? 'border-l-2 border-red-500/70' : 'border-l-2 border-transparent'}`}
              >
                <Icon size={13} className={`mt-0.5 shrink-0 ${s.c}`} />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-slate-500">{e.time}</div>
                  <div className={`font-mono text-[11.5px] leading-snug ${e.sev === 'crit' ? 'text-red-100' : 'text-slate-200'}`}>{e.text}</div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </aside>
  )
}
