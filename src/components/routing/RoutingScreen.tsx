import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Map as MapIcon, Network, Share2, Target, Waypoints } from 'lucide-react'
import { useRef } from 'react'
import { CHANNELS, type ChannelId } from '../../data/content'
import { fmtCompact, pct } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { CountUp } from '../ui/CountUp'
import { GlassPanel } from '../ui/GlassPanel'
import { StatusDot } from '../ui/StatusDot'
import { ChannelCard } from './ChannelCard'
import { CHANNEL_ICON } from './channelIcons'
import { FailoverLines } from './FailoverLines'
import { MeshVisual } from './MeshVisual'
import { TowerThumb } from './TowerThumb'

function FailoverBanner() {
  const phase = useStore((s) => s.failoverPhase)
  const broadcast = useStore((s) => s.broadcastAt !== null)
  return (
    <AnimatePresence mode="wait">
      {phase >= 3 ? (
        <motion.div
          key="banner"
          initial={{ opacity: 0, y: -14, scaleX: 0.9 }}
          animate={{ opacity: 1, y: 0, scaleX: 1 }}
          className="flex items-center gap-3 rounded-xl border border-green-400/50 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-transparent px-4 py-2.5 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-green-500/20">
            <span className="absolute inset-0 rounded-full border border-green-400/60 ping-ring" />
            <Share2 size={20} className="text-green-300" />
          </span>
          <div>
            <div className="font-hud text-lg font-bold uppercase tracking-[0.18em] text-green-200 text-glow-green">Intelligent Failover Active</div>
            <div className="text-[12.5px] text-slate-300">Mobile data unavailable. Alerts automatically rerouted through Cell Broadcast, SMS, IVR, FM, TV, Sirens, Loudspeakers, Satellite and Mesh.</div>
          </div>
          <div className="ml-auto text-right font-mono text-[11px] text-slate-400">
            <div>reroute decision · 212 ms</div>
            <div className="text-green-300">{phase >= 4 ? '9 / 10 channels delivering' : 'bringing channels online…'}</div>
          </div>
        </motion.div>
      ) : (
        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-xl border border-sky-400/15 bg-slate-900/40 px-4 py-2.5">
          <Waypoints size={18} className="text-cyan-300" />
          <span className="text-[13px] text-slate-300">
            {broadcast ? (phase === 2 ? 'Primary channel failed — computing alternate routes…' : 'Dispatching alert on primary channel…') : 'All channels on standby · awaiting alert broadcast from the Alert Composer'}
          </span>
          {broadcast && <span className="ml-auto h-2 w-2 rounded-full bg-amber-400 blink" />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChannelList() {
  const channels = useStore((s) => s.channels)
  return (
    <GlassPanel title="Channel Status" icon={Network} live className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {CHANNELS.map((c) => {
          const st = channels[c.id].state
          const Icon = CHANNEL_ICON[c.id]
          return (
            <div key={c.id} className={`flex items-center gap-2 rounded-lg px-2 py-[7px] ${st === 'failed' ? 'bg-red-500/10' : st === 'operational' ? 'bg-green-500/5' : ''}`}>
              <StatusDot color={st === 'failed' ? 'red' : st === 'operational' ? 'green' : st === 'attempting' ? 'amber' : 'grey'} size={7} />
              <Icon size={14} className={st === 'failed' ? 'text-red-400' : st === 'operational' ? 'text-green-300' : 'text-slate-500'} />
              <span className="flex-1 truncate text-[12px] text-slate-200">{c.name}</span>
              {st === 'operational' ? (
                <CountUp value={c.delivered} duration={2.4} format={(n) => (c.kind === 'units' || c.kind === 'nodes' ? String(Math.round(n)) : fmtCompact(n))} className="text-[12px] text-green-200" />
              ) : (
                <span className={`font-hud text-[10px] font-bold tracking-wider ${st === 'failed' ? 'text-red-400' : st === 'attempting' ? 'text-amber-300' : 'text-slate-600'}`}>{st.toUpperCase()}</span>
              )}
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}

function DeliveryTarget() {
  const target = useStore((s) => s.impact?.population ?? 420000)
  const opCount = useStore((s) => Object.values(s.channels).filter((c) => c.state === 'operational').length)
  const reached = Math.round(target * 0.93 * (opCount / 9))
  const p = pct(reached, target)
  return (
    <GlassPanel title="Delivery Target · This Alert" icon={Target}>
      <div className="px-3 py-2.5">
        <div className="flex items-end justify-between">
          <CountUp value={target} format="compact" className="text-3xl text-white text-glow-cyan" />
          <div className="text-right">
            <CountUp value={reached} format="compact" className="text-lg text-green-300" />
            <div className="font-mono text-[10.5px] text-slate-400">reached ({p}%)</div>
          </div>
        </div>
        <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
          <motion.div animate={{ width: `${p}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-green-400 to-green-300 shadow-[0_0_14px_rgba(74,222,128,0.7)]" />
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500">
          <span>0</span>
          <span>target {fmtCompact(target)}</span>
        </div>
      </div>
    </GlassPanel>
  )
}

function ChannelReach() {
  const channels = useStore((s) => s.channels)
  return (
    <GlassPanel title="Channel Reach" icon={Activity}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-3 py-2">
        {CHANNELS.map((c) => {
          const st = channels[c.id].state
          const v = st === 'operational' ? c.reach : 0
          return (
            <div key={c.id}>
              <div className="flex justify-between text-[10.5px]">
                <span className={st === 'failed' ? 'text-red-300' : 'text-slate-300'}>{c.short}</span>
                <span className="font-mono text-slate-400">{v}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-slate-800">
                <motion.div animate={{ width: `${v}%` }} transition={{ duration: 1.2 }} className={`h-full rounded ${st === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-green-300'}`} />
              </div>
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}

function ActivityFeed() {
  const all = useStore((s) => s.feed)
  const feed = all.filter((e) => e.cat === 'channel' || e.cat === 'alert').slice(0, 9)
  return (
    <GlassPanel title="Live Activity" icon={Activity} live className="min-h-0 flex-1">
      <div className="thin-scroll h-full overflow-y-auto px-3 py-1.5">
        <AnimatePresence initial={false}>
          {feed.map((e) => (
            <motion.div key={e.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 py-[3px] font-mono text-[11px]">
              <span className="text-slate-500">{e.time.slice(0, 5)}</span>
              <span className={e.sev === 'crit' ? 'text-red-300' : e.sev === 'ok' ? 'text-green-300' : e.sev === 'warn' ? 'text-amber-200' : 'text-slate-300'}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  )
}

export function RoutingScreen() {
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Partial<Record<ChannelId, HTMLDivElement | null>>>({})
  const others = CHANNELS.filter((c) => c.id !== 'data')

  return (
    <div className="thin-scroll pointer-events-auto absolute inset-0 overflow-y-auto overflow-x-hidden p-3">
      <div className="flex min-h-full flex-col gap-2.5">
        <div className="flex items-end gap-4">
          <div>
            <h1 className="font-display text-[22px] font-bold uppercase tracking-[0.14em] text-white">Alert Routing &amp; Communications Status</h1>
            <p className="text-[13px] text-slate-400">Multi-channel delivery for maximum reach. If one fails, others keep people informed.</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400 blink" />
            <span className="font-hud text-xs font-bold uppercase tracking-widest text-rose-200">Evacuate · VAYU-26 · Odisha coast</span>
          </div>
        </div>

        <FailoverBanner />

        <div className="flex gap-2.5">
          <div ref={gridRef} className="relative grid flex-1 grid-cols-6 grid-rows-[repeat(2,minmax(186px,auto))] gap-2.5">
            <div className="row-span-2">
              <ChannelCard def={CHANNELS[0]} big ref={(el) => void (cardRefs.current.data = el)} />
            </div>
            {others.map((c) => (
              <ChannelCard key={c.id} def={c} ref={(el) => void (cardRefs.current[c.id] = el)} />
            ))}
            <div className="flex flex-col justify-center rounded-xl border border-dashed border-cyan-400/25 bg-cyan-400/5 p-3">
              <Waypoints size={22} className="text-cyan-300" />
              <div className="mt-1 font-hud text-[13px] font-bold uppercase tracking-wider text-cyan-100">Routing engine</div>
              <div className="mt-1 space-y-0.5 font-mono text-[10.5px] text-slate-400">
                <div>policy: max-reach</div>
                <div>dedupe: on · 4.2L IDs</div>
                <div>retry: exp-backoff</div>
                <div className="text-green-300">health: nominal</div>
              </div>
            </div>
            <FailoverLines container={gridRef} cards={cardRefs} />
          </div>
          <div className="hidden w-[250px] shrink-0 min-[1600px]:block">
            <ChannelList />
          </div>
        </div>

        <div className="grid min-h-[280px] flex-1 grid-cols-[1fr_1.35fr_1fr] gap-2.5">
          <div className="flex flex-col gap-2.5">
            <DeliveryTarget />
            <ChannelReach />
          </div>
          <GlassPanel title="Mesh Relay · Village View" icon={Network} live bodyClassName="p-2">
            <MeshVisual />
          </GlassPanel>
          <div className="flex min-h-0 flex-col gap-2.5">
            <ActivityFeed />
            <TowerHealth />
          </div>
        </div>
      </div>
    </div>
  )
}

function TowerHealth() {
  return (
    <GlassPanel title="Channel Health · Towers" icon={MapIcon} className="h-[190px] shrink-0" bodyClassName="p-2">
      <TowerThumb />
    </GlassPanel>
  )
}
