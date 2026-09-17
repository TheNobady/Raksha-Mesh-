import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { NODE_BY_ID, NODE_META } from '../../data/infrastructure'
import { VILLAGE_BY_ID, districtName } from '../../data/villages'
import { fmtIN } from '../../lib/format'
import { useMapUi } from '../../lib/mapInstance'
import { useStore } from '../../store/scenarioStore'
import { StatusDot } from '../ui/StatusDot'

const ACK_LABEL = { pending: 'Not yet confirmed', ack: 'Acknowledged', partial: 'Partially reached', unreached: 'UNREACHED' }

export function MapTooltip() {
  const hover = useMapUi((s) => s.hover)
  const towersDown = useStore((s) => s.towersDown)
  const ack = useStore((s) => s.villageAck)
  const sos = useStore((s) => s.sos)
  if (!hover) return null

  let body: React.ReactNode = null
  if (hover.kind === 'node') {
    const n = NODE_BY_ID[hover.id]
    if (!n) return null
    const down = !!towersDown[n.id]
    body = (
      <>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${NODE_META[n.type].color.join(',')})` }} />
          <span className="font-hud text-[11px] uppercase tracking-wider text-slate-400">{NODE_META[n.type].label}</span>
        </div>
        <div className="mt-0.5 text-sm font-semibold text-white">{n.name}</div>
        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[11px]">
          <span className="text-slate-500">Status</span>
          <span className={`flex items-center gap-1.5 ${down ? 'text-red-400' : 'text-green-400'}`}>
            <StatusDot color={down ? 'red' : 'green'} size={6} /> {down ? 'OFFLINE' : 'ONLINE'}
          </span>
          <span className="text-slate-500">Uptime</span>
          <span className="text-slate-200">{down ? '—' : `${n.uptime}%`}</span>
          <span className="text-slate-500">Last ping</span>
          <span className="text-slate-200">{down ? '4m 12s ago' : `${(n.id.length % 7) + 1}s ago`}</span>
          {n.capacity && (
            <>
              <span className="text-slate-500">Capacity</span>
              <span className="text-slate-200">{fmtIN(n.capacity)}</span>
            </>
          )}
        </div>
      </>
    )
  } else if (hover.kind === 'village') {
    const v = VILLAGE_BY_ID[hover.id]
    if (!v) return null
    const st = ack[v.id] ?? 'pending'
    body = (
      <>
        <div className="font-hud text-[11px] uppercase tracking-wider text-slate-400">Village · {districtName(v.district)}</div>
        <div className="text-sm font-semibold text-white">{v.name}</div>
        <div className="mt-1 grid grid-cols-2 gap-x-4 font-mono text-[11px]">
          <span className="text-slate-500">Population</span>
          <span>{fmtIN(v.population)}</span>
          <span className="text-slate-500">Households</span>
          <span>{fmtIN(v.households)}</span>
          <span className="text-slate-500">Shelter</span>
          <span>{v.shelterKm} km</span>
          <span className="text-slate-500">Alert</span>
          <span className={st === 'ack' ? 'text-green-400' : st === 'unreached' ? 'text-red-400' : st === 'partial' ? 'text-amber-300' : 'text-slate-300'}>{ACK_LABEL[st]}</span>
        </div>
      </>
    )
  } else if (hover.kind === 'sos') {
    const x = sos.find((q) => q.id === hover.id)
    if (!x) return null
    body = (
      <>
        <div className="font-hud text-[11px] uppercase tracking-wider text-red-300">SOS · {x.source}</div>
        <div className="text-sm font-semibold text-white">{x.place} · {x.people} people</div>
        <div className="mt-1 text-[11px] text-slate-300">{x.tags.join(' · ')}</div>
      </>
    )
  }

  return (
    <div className="pointer-events-none absolute z-30 glass-strong rounded-lg px-3 py-2 min-w-[190px]" style={{ left: hover.x + 14, top: hover.y + 14 }}>
      {body}
    </div>
  )
}

export function NodeDetailCard() {
  const id = useStore((s) => s.selectedNodeId)
  const set = useStore((s) => s.set)
  const towersDown = useStore((s) => s.towersDown)
  const n = id ? NODE_BY_ID[id] : null
  return (
    <AnimatePresence>
      {n && (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          className="pointer-events-auto glass-strong brackets absolute bottom-24 left-1/2 z-30 w-80 -translate-x-1/2 rounded-xl p-4"
        >
          <span className="bk tl" />
          <span className="bk tr" />
          <span className="bk bl" />
          <span className="bk br" />
          <button onClick={() => set({ selectedNodeId: null })} className="absolute right-3 top-3 text-slate-500 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
          <div className="label">{NODE_META[n.type].label}</div>
          <div className="mt-1 text-base font-semibold text-white">{n.name}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ['Status', towersDown[n.id] ? 'OFFLINE' : 'ONLINE'],
              ['Uptime', `${n.uptime}%`],
              ['Power', towersDown[n.id] ? 'LOST' : 'GRID+BAT'],
              ['Link', towersDown[n.id] ? 'NONE' : n.type === 'lora' ? 'LoRa' : 'Fibre+MW'],
              ['Lat', n.lngLat[1].toFixed(3)],
              ['Lng', n.lngLat[0].toFixed(3)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-sky-400/10 bg-slate-900/50 p-1.5">
                <div className="font-hud text-[9px] uppercase tracking-widest text-slate-500">{k}</div>
                <div className={`font-mono text-xs ${v === 'OFFLINE' || v === 'LOST' || v === 'NONE' ? 'text-red-400' : 'text-slate-100'}`}>{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
