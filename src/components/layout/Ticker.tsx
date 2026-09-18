import { CloudLightning } from 'lucide-react'
import { CALM_TICKER, TICKER_ITEMS } from '../../data/content'
import { useStore } from '../../store/scenarioStore'

export function Ticker() {
  const calm = useStore((s) => s.phase === 'calm')
  const source = calm ? CALM_TICKER : TICKER_ITEMS
  const items = [...source, ...source]
  return (
    <footer className="relative z-30 flex h-8 shrink-0 items-center overflow-hidden border-t border-sky-400/15 bg-[#050d1c]/95">
      <div className="z-10 flex h-full shrink-0 items-center gap-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 pl-4 pr-8">
        <CloudLightning size={14} className="text-amber-300" />
        <span className="font-hud text-xs font-bold uppercase tracking-[0.2em] text-amber-200">{calm ? 'Daily Bulletin' : 'Weather Bulletin'}</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee flex w-max gap-12 whitespace-nowrap font-mono text-xs text-slate-300">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="text-cyan-400">◆</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
