import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, Filter, MapPinned, Radar, Send, TriangleAlert, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DISTRICTS } from '../../data/geography'
import { STORY_VILLAGES, VILLAGE_BY_ID, VILLAGES, districtName } from '../../data/villages'
import { fmtIN, pct } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { MapControls } from '../map/MapControls'
import { MapSlot } from '../map/MapSlot'
import { CountUp } from '../ui/CountUp'
import { GlassPanel } from '../ui/GlassPanel'
import { Funnel } from './Funnel'

function useAckCounts() {
  const ack = useStore((s) => s.villageAck)
  const zone = useStore((s) => s.zoneVillageIds)
  let a = 0
  let p = 0
  let u = 0
  zone.forEach((id) => {
    const st = ack[id]
    if (st === 'ack') a++
    else if (st === 'partial') p++
    else if (st === 'unreached') u++
  })
  return { ack: a, partial: p, unreached: u, pending: zone.length - a - p - u, total: zone.length }
}

function MapLegend() {
  const c = useAckCounts()
  const items = [
    { label: 'Acknowledged', color: '#4ADE80', v: c.ack },
    { label: 'Partially reached', color: '#F59E0B', v: c.partial },
    { label: 'Not yet confirmed', color: '#94A3B8', v: c.pending },
    { label: 'Unreached', color: '#EF4444', v: c.unreached },
  ]
  return (
    <div className="glass pointer-events-auto rounded-xl p-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <Radar size={13} className="text-green-300" />
        <span className="label">Acknowledgement heatmap</span>
      </div>
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 py-0.5 text-[11.5px]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color, boxShadow: `0 0 8px ${i.color}` }} />
          <span className="flex-1 text-slate-300">{i.label}</span>
          <CountUp value={i.v} className="text-[12px] text-slate-100" duration={0.6} />
        </div>
      ))}
      <div className="mt-1.5 border-t border-sky-400/10 pt-1.5 font-mono text-[10px] text-slate-500">{c.total} villages in alert zone</div>
    </div>
  )
}

function AckByChannel() {
  const reach = useStore((s) => s.reach)
  const data = DISTRICTS.filter((d) => ['kendrapara', 'jagatsinghpur', 'puri', 'bhadrak', 'balasore', 'cuttack'].includes(d.id)).map((d, i) => {
    const base = reach.ack * [0.24, 0.2, 0.19, 0.14, 0.13, 0.1][i]
    return {
      name: d.name.slice(0, 6),
      App: Math.round(base * 0.22),
      IVR: Math.round(base * 0.38),
      'Missed call': Math.round(base * 0.18),
      Volunteer: Math.round(base * 0.22),
    }
  })
  const colors = { App: '#22D3EE', IVR: '#4ADE80', 'Missed call': '#A78BFA', Volunteer: '#FB923C' }
  return (
    <GlassPanel title="Acknowledgement by channel" icon={BarChart3} className="min-h-0" bodyClassName="px-2 pb-1 pt-2">
      <div className="mb-1 flex flex-wrap gap-2 px-1">
        {Object.entries(colors).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-sm" style={{ background: c }} /> {k === 'IVR' ? 'IVR "Press 1"' : k === 'Volunteer' ? 'Door-to-door' : k === 'App' ? 'App tap' : k}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={52} tick={{ fill: '#94A3B8', fontSize: 10.5 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'rgba(34,211,238,0.06)' }} contentStyle={{ background: '#0b1628', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, fontSize: 11 }} />
          {Object.entries(colors).map(([k, c], i) => (
            <Bar key={k} dataKey={k} stackId="a" fill={c} radius={i === 3 ? [0, 4, 4, 0] : 0} barSize={13} animationDuration={900} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </GlassPanel>
  )
}

function DistrictAck() {
  const ack = useStore((s) => s.villageAck)
  const zone = useStore((s) => s.zoneVillageIds)
  const rows = DISTRICTS.map((d) => {
    const ids = zone.filter((id) => VILLAGE_BY_ID[id]?.district === d.id)
    const a = ids.filter((id) => ack[id] === 'ack').length
    const u = ids.filter((id) => ack[id] === 'unreached').length
    return { d, n: ids.length, a, u }
  }).filter((r) => r.n > 0)
  return (
    <GlassPanel title="By district" icon={Filter}>
      <div className="px-2 py-1.5">
        <div className="grid grid-cols-[1fr_44px_1fr_40px] gap-2 px-1 pb-1 font-hud text-[9.5px] uppercase tracking-widest text-slate-500">
          <span>District</span>
          <span>Vill.</span>
          <span>Acknowledged</span>
          <span className="text-right">Unr.</span>
        </div>
        {rows.map((r) => {
          const p = pct(r.a, r.n)
          return (
            <div key={r.d.id} className="grid grid-cols-[1fr_44px_1fr_40px] items-center gap-2 px-1 py-[3px] text-[11.5px]">
              <span className="text-slate-200">{r.d.name}</span>
              <span className="font-mono text-slate-400">{r.n}</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 flex-1 overflow-hidden rounded bg-slate-800">
                  <motion.span animate={{ width: `${p}%` }} className="block h-full rounded bg-gradient-to-r from-green-600 to-green-300" />
                </span>
                <span className="w-8 text-right font-mono text-[10.5px] text-green-300">{p}%</span>
              </span>
              <span className={`text-right font-mono ${r.u ? 'text-red-400' : 'text-slate-600'}`}>{r.u}</span>
            </div>
          )
        })}
        {rows.length === 0 && <div className="py-4 text-center text-[11px] text-slate-500">Broadcast an alert to start tracking reach</div>}
      </div>
    </GlassPanel>
  )
}

function UnreachedList() {
  const ack = useStore((s) => s.villageAck)
  const volunteer = useStore((s) => s.volunteer.stage)
  const dispatchVolunteer = useStore((s) => s.volunteerTask)
  const flyTo = useStore((s) => s.flyTo)
  const list = VILLAGES.filter((v) => ack[v.id] === 'unreached' || ((ack[v.id] === 'partial' || ack[v.id] === 'ack') && [STORY_VILLAGES.kantiapada, STORY_VILLAGES.balijhari, STORY_VILLAGES.nuagaon].includes(v.id as never)))
  return (
    <GlassPanel title="Unreached villages" icon={TriangleAlert} right={<span className="font-mono text-[10px] text-red-300">{list.filter((v) => ack[v.id] === 'unreached').length} open</span>}>
      <div className="space-y-1.5 p-2">
        <AnimatePresence initial={false}>
          {list.map((v) => {
            const st = ack[v.id]
            const isK = v.id === STORY_VILLAGES.kantiapada
            const assigned = isK && volunteer !== 'idle'
            return (
              <motion.div key={v.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${st === 'ack' ? 'border-green-400/30 bg-green-500/5' : st === 'partial' ? 'border-amber-400/40 bg-amber-500/5' : 'border-red-500/40 bg-red-500/10'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${st === 'ack' ? 'bg-green-400' : st === 'partial' ? 'bg-amber-400' : 'bg-red-500 blink'}`} />
                <button onClick={() => flyTo(v.lngLat, 11, 45)} className="min-w-0 flex-1 text-left cursor-pointer">
                  <div className="text-[12.5px] font-semibold text-slate-100">{v.name}</div>
                  <div className="font-mono text-[10px] text-slate-400">
                    {districtName(v.district)} · {fmtIN(v.households)} hh · {st === 'ack' ? 'now reached' : st === 'partial' ? 'volunteer on site' : 'no response · all channels'}
                  </div>
                </button>
                {st === 'unreached' || (isK && st !== 'ack') ? (
                  <button
                    onClick={() => isK && dispatchVolunteer()}
                    disabled={assigned || !isK}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 font-hud text-[10.5px] font-bold uppercase tracking-wider cursor-pointer ${assigned ? 'border-orange-400/40 text-orange-300' : isK ? 'border-orange-400/60 bg-orange-500/15 text-orange-100 hover:bg-orange-500/25' : 'border-slate-600 text-slate-400'}`}
                  >
                    <UsersRound size={12} /> {assigned ? 'Volunteer en route' : isK ? 'Dispatch volunteer' : 'Rescue queue'}
                  </button>
                ) : (
                  <span className="font-hud text-[10.5px] font-bold uppercase text-green-300">✓ Reached</span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
        {list.length === 0 && (
          <div className="flex items-center gap-2 py-3 text-[11px] text-slate-500">
            <Send size={13} /> Unreached villages appear here after acknowledgement waves
          </div>
        )}
      </div>
    </GlassPanel>
  )
}

export function ReachScreen() {
  const zone = useStore((s) => s.zone)
  const c = useAckCounts()
  useEffect(() => {
    const t = window.setTimeout(() => useStore.getState().flyTo([86.45, 20.4], 8.4, 40, -8), 600)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div className="absolute inset-0">
      <MapSlot className="absolute bottom-3 left-3 top-3 right-[calc(40%+6px)]" />
      <div className="pointer-events-none absolute bottom-3 left-3 top-3 right-[calc(40%+6px)]">
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <div className="glass pointer-events-auto rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <MapPinned size={14} className="text-cyan-300" />
              <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">Reach &amp; Acknowledgement</span>
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] text-slate-400">{zone ? 'Every village in the danger zone, tracked live' : 'No active alert zone'}</div>
          </div>
          <div className="glass pointer-events-auto rounded-xl px-3 py-2 text-center">
            <div className="font-hud text-[10px] uppercase tracking-widest text-slate-400">Villages confirmed</div>
            <CountUp value={pct(c.ack, c.total)} format={(n) => `${Math.round(n)}%`} className="text-xl text-green-300 text-glow-green" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <MapLegend />
        </div>
        <div className="absolute right-3 top-3">
          <MapControls />
        </div>
      </div>
      <div className="thin-scroll pointer-events-auto absolute bottom-3 right-3 top-3 flex w-[40%] flex-col gap-2 overflow-y-auto">
        <GlassPanel title="Delivery funnel" icon={Filter} live bodyClassName="p-3">
          <Funnel />
        </GlassPanel>
        <UnreachedList />
        <div className="grid grid-cols-1 gap-2 min-[1700px]:grid-cols-2">
          <AckByChannel />
          <DistrictAck />
        </div>
      </div>
    </div>
  )
}
