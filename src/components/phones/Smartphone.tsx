import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Bluetooth, Building2, Footprints, HeartHandshake, MapPin, ShieldAlert, Siren, Wifi } from 'lucide-react'
import { TEMPLATES } from '../../data/content'
import { useStore } from '../../store/scenarioStore'
import { SmartFrame, useClock } from './PhoneFrame'

function LockScreen() {
  const time = useClock()
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e3a8a,#0b1227_55%,#020617)]">
      <div className="mt-20 text-center text-white">
        <div className="text-[56px] font-extralight leading-none tracking-tight">{time}</div>
        <div className="mt-1 text-[12px] text-slate-300">Kendrapara · 27°C · Heavy rain</div>
      </div>
      <div className="absolute inset-x-3 top-52 rounded-2xl bg-white/10 p-2.5 text-[11px] text-slate-200 backdrop-blur">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldAlert size={11} className="text-cyan-300" /> RAKSHA MESH · now
        </div>
        Cyclone watch active for your area. Keep phone charged.
      </div>
      <div className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/60" />
    </div>
  )
}

function AlertTakeover() {
  const english = useStore((s) => s.smart.english)
  const patch = useStore((s) => s.smartPatch)
  const tpl = TEMPLATES[0]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col bg-gradient-to-b from-red-600 via-red-800 to-red-950 px-3 pb-4 pt-9 text-white">
      <motion.div animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 0.9, repeat: Infinity }} className="flex items-center justify-center gap-2">
        <Siren size={22} />
        <span className="font-display text-[17px] font-bold tracking-[0.18em]">EXTREME ALERT</span>
      </motion.div>
      <div className="mx-auto mt-1.5 flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[9.5px]">
        <BadgeCheck size={11} className="text-green-300" /> Raksha Mesh · Govt. Verified
      </div>
      <div className="mt-2 font-hud text-[13px] font-bold uppercase tracking-wider text-yellow-200">Cyclone VAYU-26 · Evacuate now</div>
      <p className="mt-1.5 flex-1 overflow-hidden text-[12.5px] leading-snug">{english ? tpl.text.en : tpl.text.or}</p>
      <button onClick={() => patch({ english: !english })} className="mb-2 self-start rounded-full border border-white/40 px-2 py-0.5 text-[10px] cursor-pointer">
        {english ? 'ଓଡ଼ିଆ' : 'English'}
      </button>
      <button onClick={() => patch({ stage: 'app' })} className="rounded-xl bg-white py-2.5 text-[13px] font-bold text-red-700 cursor-pointer">
        Open Raksha Mesh
      </button>
    </motion.div>
  )
}

function AppScreen() {
  const smart = useStore((s) => s.smart)
  const patch = useStore((s) => s.smartPatch)
  const safe = useStore((s) => s.smartSafe)
  const sos = useStore((s) => s.smartSOS)
  const tabs = [
    { id: 'status' as const, icon: ShieldAlert, label: 'Status' },
    { id: 'shelter' as const, icon: Building2, label: 'Shelter' },
    { id: 'mesh' as const, icon: Bluetooth, label: 'Mesh' },
  ]
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0f1c] pt-8 text-white">
      <div className="flex items-center gap-2 px-3 pb-2">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-cyan-500/20">
          <ShieldAlert size={14} className="text-cyan-300" />
        </div>
        <span className="font-hud text-[13px] font-bold tracking-wider">RAKSHA MESH</span>
        <span className="ml-auto rounded bg-red-500/20 px-1.5 text-[9px] text-red-300">OFFLINE MODE</span>
      </div>
      <div className="relative flex-1 overflow-hidden px-3">
        <AnimatePresence mode="wait">
          {smart.tab === 'status' && (
            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex h-full flex-col gap-2">
              <div className="rounded-2xl border border-red-500/50 bg-red-500/15 p-3">
                <div className="text-[10px] uppercase tracking-widest text-red-300">Am I safe?</div>
                <div className="mt-0.5 font-hud text-[20px] font-bold leading-tight text-red-200">EVACUATE NOW</div>
                <div className="text-[11px] text-slate-300">Your area (Astaranga) is inside the danger zone.</div>
              </div>
              <button
                onClick={safe}
                disabled={smart.safe}
                className={`rounded-2xl py-3.5 font-hud text-[18px] font-bold tracking-wider cursor-pointer ${smart.safe ? 'bg-green-900/60 text-green-300' : 'bg-green-500 text-green-950 shadow-[0_0_24px_rgba(34,197,94,0.6)]'}`}
              >
                {smart.safe ? '✓ MARKED SAFE' : "I'M SAFE"}
              </button>
              {smart.safe && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-1.5 text-[10.5px] text-green-200">
                  <HeartHandshake size={13} /> Sent to 4 family members via Mesh
                </motion.div>
              )}
              <button
                onClick={sos}
                disabled={smart.sos}
                className={`relative mt-auto mb-2 grid h-[74px] w-[74px] place-items-center self-center rounded-full font-hud text-[20px] font-bold cursor-pointer ${smart.sos ? 'bg-slate-700 text-slate-300' : 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.8)]'}`}
              >
                {!smart.sos && <span className="absolute inset-0 rounded-full border-2 border-red-400 ping-ring" />}
                {smart.sos ? 'SENT' : 'SOS'}
              </button>
            </motion.div>
          )}
          {smart.tab === 'shelter' && (
            <motion.div key="shelter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex h-full flex-col gap-2">
              <div className="text-[10px] uppercase tracking-widest text-cyan-300">Nearest shelter</div>
              <svg viewBox="0 0 200 150" className="w-full rounded-xl bg-[#0f1b2e]">
                <path d="M0 110 Q60 90 100 120 T200 100" stroke="#1e3a5f" strokeWidth="14" fill="none" />
                {Array.from({ length: 14 }).map((_, i) => (
                  <rect key={i} x={(i * 47) % 180 + 8} y={(i * 29) % 90 + 8} width="10" height="8" fill="#1e293b" />
                ))}
                <path d="M40 120 L60 80 L110 70 L150 40" stroke="#22D3EE" strokeWidth="3" fill="none" strokeDasharray="6 5" className="dash-flow" />
                <circle cx="40" cy="120" r="6" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
                <g transform="translate(150 40)">
                  <circle r="11" fill="#22C55E" opacity="0.3" />
                  <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#22C55E" />
                </g>
              </svg>
              <div className="rounded-xl bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <Building2 size={14} className="text-green-300" /> Govt. High School Shelter
                </div>
                <div className="mt-1 flex gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> 1.2 km
                  </span>
                  <span className="flex items-center gap-1">
                    <Footprints size={11} /> 16 min
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-green-300">180 spaces left · food · medical desk</div>
              </div>
              <button className="rounded-xl bg-cyan-500 py-2 text-[12px] font-bold text-cyan-950">Start offline navigation</button>
            </motion.div>
          )}
          {smart.tab === 'mesh' && (
            <motion.div key="mesh" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex h-full flex-col items-center gap-3 pt-2 text-center">
              <div className="relative grid h-28 w-28 place-items-center">
                {smart.mesh &&
                  [0, 1, 2].map((i) => <span key={i} className="absolute inset-0 rounded-full border-2 border-teal-400/70 ping-ring" style={{ animationDelay: `${i * 0.6}s` }} />)}
                <div className={`grid h-16 w-16 place-items-center rounded-full ${smart.mesh ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-500'}`}>
                  <Bluetooth size={30} />
                </div>
              </div>
              <div className="font-hud text-[15px] font-bold tracking-wide">Emergency Mode</div>
              <p className="text-[11px] text-slate-400">Turn on Bluetooth &amp; Wi-Fi to help relay alerts to your neighbours.</p>
              <button onClick={() => patch({ mesh: !smart.mesh })} className={`relative h-8 w-14 rounded-full transition-colors cursor-pointer ${smart.mesh ? 'bg-teal-500' : 'bg-slate-700'}`}>
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${smart.mesh ? 'left-7' : 'left-1'}`} />
              </button>
              {smart.mesh && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[11px] text-teal-200">
                  <Wifi size={12} /> Relaying to 23 nearby phones · 4 hops
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex border-t border-white/10 bg-black/40 px-2 pb-3 pt-1.5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => patch({ tab: t.id })} className={`flex flex-1 flex-col items-center gap-0.5 text-[9.5px] cursor-pointer ${smart.tab === t.id ? 'text-cyan-300' : 'text-slate-500'}`}>
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Smartphone() {
  const stage = useStore((s) => s.smart.stage)
  return (
    <SmartFrame shake={stage === 'alert'}>
      {stage === 'lock' && <LockScreen />}
      {stage === 'alert' && <AlertTakeover />}
      {stage === 'app' && <AppScreen />}
      <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-20 -translate-x-1/2 rounded-full bg-white/40" />
    </SmartFrame>
  )
}
