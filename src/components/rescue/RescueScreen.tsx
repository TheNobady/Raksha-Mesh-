import { motion } from 'framer-motion'
import { BedDouble, Drone, Plane, Ship, Truck, Users } from 'lucide-react'
import { useEffect } from 'react'
import { RESCUE_TEAMS } from '../../data/rescue'
import { clamp } from '../../lib/geo'
import { useStore } from '../../store/scenarioStore'
import { MapControls } from '../map/MapControls'
import { MapSlot } from '../map/MapSlot'
import { CountUp } from '../ui/CountUp'
import { GlassPanel } from '../ui/GlassPanel'
import { StatusDot } from '../ui/StatusDot'
import { DroneView } from './DroneView'
import { SOSBoard } from './SOSBoard'

function Assets() {
  const units = useStore((s) => s.units)
  const elapsed = useStore((s) => s.elapsed)
  const rescued = useStore((s) => s.kpi.rescued)
  const active = units.filter((u) => !u.arrived)
  const stats = [
    { icon: Ship, label: 'Boats available', v: 18 - active.length, total: 18, color: 'text-orange-300' },
    { icon: Plane, label: 'Helicopters', v: 3, total: 4, color: 'text-slate-200' },
    { icon: Drone, label: 'Drones airborne', v: 6, total: 8, color: 'text-cyan-300' },
    { icon: BedDouble, label: 'Hospital beds nearby', v: 214, total: 0, color: 'text-rose-300' },
  ]
  return (
    <GlassPanel title="Rescue Assets" icon={Truck} live className="h-full" bodyClassName="thin-scroll overflow-y-auto">
      <div className="grid grid-cols-2 gap-1.5 p-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-950/50 px-2 py-1.5">
            <div className="flex items-center gap-1 text-slate-400">
              <s.icon size={12} className={s.color} />
              <span className="font-hud text-[9.5px] uppercase tracking-wider truncate">{s.label}</span>
            </div>
            <div className="num text-[17px] text-slate-100">
              {s.v}
              {s.total ? <span className="text-[11px] text-slate-500">/{s.total}</span> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-2 mb-2 flex items-center justify-between rounded-lg border border-green-400/30 bg-green-500/10 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 font-hud text-[11px] font-bold uppercase tracking-wider text-green-200">
          <Users size={13} /> Rescued today
        </span>
        <CountUp value={rescued} className="text-lg text-green-300 text-glow-green" />
      </div>
      {active.length > 0 && (
        <div className="mx-2 mb-2 space-y-1.5">
          {active.map((u) => {
            const f = clamp((elapsed - u.startAt) / u.duration)
            return (
              <div key={u.id} className="rounded-lg border border-cyan-400/30 bg-cyan-500/5 px-2 py-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-cyan-100">
                    <Ship size={12} /> {u.name}
                  </span>
                  <span className="font-mono text-cyan-300">ETA {Math.max(0, Math.ceil((1 - f) * 14))} min</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-800">
                  <div className="h-full rounded bg-gradient-to-r from-cyan-500 to-cyan-300" style={{ width: `${f * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="px-2 pb-2">
        <div className="mb-1 font-hud text-[10px] uppercase tracking-widest text-slate-500">Teams</div>
        {RESCUE_TEAMS.map((t) => (
          <div key={t.name} className="flex items-center gap-2 py-[3px] text-[11px]">
            <StatusDot color={t.status === 'On site' ? 'green' : t.status === 'En route' ? 'amber' : t.status === 'Returning' ? 'cyan' : 'grey'} size={6} />
            <span className="flex-1 truncate text-slate-200">{t.name}</span>
            <span className="font-mono text-[10px] text-slate-400">{t.status}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}

export function RescueScreen() {
  useEffect(() => {
    const t = window.setTimeout(() => useStore.getState().flyTo([86.38, 20.3], 9.2, 45, -10), 600)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div className="absolute inset-0 grid grid-cols-[minmax(340px,34%)_1fr] gap-2.5 p-3">
      <div className="pointer-events-auto min-h-0">
        <SOSBoard />
      </div>
      <div className="grid min-h-0 grid-rows-[1.35fr_1fr] gap-2.5">
        <div className="relative">
          <MapSlot className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0">
            <div className="glass pointer-events-auto absolute left-3 top-3 rounded-xl px-3 py-2">
              <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">Dispatch &amp; Rescue Map</div>
              <div className="font-mono text-[10.5px] text-slate-400">NDRF base Kujang · boats · helicopters · drones</div>
            </div>
            <div className="absolute right-3 top-3">
              <MapControls />
            </div>
          </div>
        </div>
        <div className="pointer-events-auto grid min-h-0 grid-cols-[1.5fr_1fr] gap-2.5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass brackets flex min-h-0 flex-col rounded-xl p-1.5">
            <span className="bk tl" />
            <span className="bk tr" />
            <span className="bk bl" />
            <span className="bk br" />
            <div className="flex items-center gap-2 px-1.5 pb-1.5">
              <Drone size={13} className="text-cyan-300" />
              <span className="label">Drone feed · D-3 thermal</span>
              <span className="ml-auto font-mono text-[10px] text-red-300">● LIVE</span>
            </div>
            <div className="min-h-0 flex-1">
              <DroneView />
            </div>
          </motion.div>
          <div className="min-h-0">
            <Assets />
          </div>
        </div>
      </div>
    </div>
  )
}
