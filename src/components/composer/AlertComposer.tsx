import { motion } from 'framer-motion'
import { BellRing, Circle, MousePointer2, Pentagon, Sparkles, Trash2 } from 'lucide-react'
import { fmtCompact } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { MapControls } from '../map/MapControls'
import { MapSlot } from '../map/MapSlot'
import { AlertConfig } from './AlertConfig'
import { ApprovalModal, BroadcastControls } from './Broadcast'
import { ImpactStrip, TopVillages } from './ImpactPanel'
import { MessagePreview } from './MessagePreview'
import { useTerraDraw } from './useTerraDraw'

function DrawToolbar() {
  const { setMode, suggest, clear } = useTerraDraw()
  const mode = useStore((s) => s.drawMode)
  const hasZone = useStore((s) => !!s.zone)
  const tool = (active: boolean) =>
    `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-hud text-[11.5px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${active ? 'bg-cyan-400/20 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.6)]' : 'text-slate-300 hover:bg-white/5'}`
  return (
    <div className="glass pointer-events-auto flex items-center gap-1 rounded-xl p-1">
      <button className={tool(mode === 'polygon')} onClick={() => setMode('polygon')}>
        <Pentagon size={14} /> Polygon
      </button>
      <button className={tool(mode === 'circle')} onClick={() => setMode('circle')}>
        <Circle size={14} /> Radius
      </button>
      <button className={tool(mode === 'select')} onClick={() => setMode('select')} disabled={!hasZone}>
        <MousePointer2 size={14} /> Edit
      </button>
      <span className="mx-1 h-5 w-px bg-sky-400/20" />
      <button className={`${tool(false)} text-amber-200`} onClick={suggest}>
        <Sparkles size={14} /> Suggest from forecast
      </button>
      <button className={tool(false)} onClick={clear} disabled={!hasZone} title="Delete zone">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function DrawHint() {
  const mode = useStore((s) => s.drawMode)
  const impact = useStore((s) => s.impact)
  const text =
    mode === 'polygon'
      ? 'Click to add points · click the first point to close the danger zone'
      : mode === 'circle'
        ? 'Click the centre, move out, click again to set the radius'
        : impact
          ? `Drag vertices or midpoints to reshape · ${fmtCompact(impact.population)} people inside`
          : 'Choose Polygon or Suggest from forecast to define the danger zone'
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-slate-950/80 px-3 py-1.5 font-mono text-[11px] text-cyan-200 ring-1 ring-cyan-400/20">
      {text}
    </motion.div>
  )
}

export function AlertComposer() {
  return (
    <div className="absolute inset-0">
      <MapSlot className="absolute bottom-3 left-3 top-3 right-[calc(38%+6px)]" />
      <div className="pointer-events-none absolute bottom-3 left-3 top-3 right-[calc(38%+6px)]">
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          <DrawToolbar />
          <DrawHint />
        </div>
        <div className="absolute right-3 top-3 flex items-start gap-2">
          <TopVillages />
          <MapControls />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <ImpactStrip />
        </div>
      </div>

      <motion.aside
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass brackets pointer-events-auto absolute bottom-3 right-3 top-3 flex w-[38%] flex-col rounded-xl"
      >
        <span className="bk tl" />
        <span className="bk tr" />
        <span className="bk bl" />
        <span className="bk br" />
        <div className="flex items-center gap-2 border-b border-sky-400/15 px-4 py-3">
          <BellRing size={16} className="text-rose-300" />
          <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Alert Composer</span>
          <span className="ml-auto rounded border border-cyan-400/30 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">CAP 1.2 · SACHET</span>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
          <AlertConfig />
          <MessagePreview />
        </div>
        <div className="border-t border-rose-400/20 bg-gradient-to-t from-rose-950/30 to-transparent">
          <BroadcastControls />
        </div>
      </motion.aside>
      <ApprovalModal />
    </div>
  )
}
