import { AnimatePresence, motion } from 'framer-motion'
import { Power } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sound } from '../../audio/soundManager'
import { useStore } from '../../store/scenarioStore'
import { Logo } from '../ui/Logo'

const BOOT = [
  'Initialising secure kernel ……………… OK',
  'Connecting to 1,248 nodes ……………… OK',
  'Syncing IMD / INCOIS feeds ……………… OK',
  'Verifying cell broadcast gateways …… OK',
  'Arming FM · TV · siren · PA relays …… OK',
  'LoRa village mesh: 312 nodes ………… OK',
  'Satellite fallback link (VSAT) ……… OK',
  'Loading 465 villages · 72 shelters …… OK',
]

export function StartOverlay() {
  const started = useStore((s) => s.started)
  const [lines, setLines] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (lines >= BOOT.length) return
    const t = window.setTimeout(() => setLines((l) => l + 1), 260 + (lines % 3) * 90)
    return () => window.clearTimeout(t)
  }, [lines])

  const start = () => {
    if (leaving) return
    sound.unlock()
    sound.play('confirm')
    setLeaving(true)
    window.setTimeout(() => {
      useStore.setState({ started: true, isPlaying: true })
      sound.play('whoosh')
    }, 650)
  }

  return (
    <AnimatePresence>
      {!started && (
        <motion.div
          key="start"
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] grid place-items-center bg-[radial-gradient(ellipse_at_center,rgba(10,22,40,0.82),rgba(3,7,18,0.97))] backdrop-blur-[3px]"
        >
          <div className="bg-grid absolute inset-0 opacity-60" />
          <motion.div
            animate={leaving ? { scale: 0.92, opacity: 0 } : { scale: 1, opacity: 1 }}
            initial={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center"
          >
            <div className="relative">
              <div className="absolute inset-[-40px] rounded-full border border-cyan-400/20 spin-slow" style={{ borderTopColor: 'rgba(34,211,238,0.8)' }} />
              <div className="absolute inset-[-64px] rounded-full border border-green-400/10 spin-slow" style={{ animationDirection: 'reverse', animationDuration: '14s', borderBottomColor: 'rgba(74,222,128,0.6)' }} />
              <Logo size={120} animated />
            </div>
            <h1 className="mt-16 font-display text-5xl font-bold tracking-[0.3em] text-white">
              RAKSHA<span className="text-cyan-300 text-glow-cyan"> MESH</span>
            </h1>
            <p className="mt-3 font-hud text-sm uppercase tracking-[0.5em] text-slate-400">National Disaster Command · Early Warning Network</p>

            <div className="mt-8 h-[190px] w-[520px] rounded-lg border border-sky-400/15 bg-black/40 p-4 font-mono text-[12px] text-slate-300">
              {BOOT.slice(0, lines).map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex">
                  <span className="mr-2 text-cyan-500">&gt;</span>
                  <span>{l.replace(' OK', '')}</span>
                  <span className="ml-1 font-bold text-green-400">OK</span>
                </motion.div>
              ))}
              {lines < BOOT.length && <span className="blink text-cyan-300">▋</span>}
            </div>

            <button
              onClick={start}
              className={`group relative mt-10 overflow-hidden rounded-xl border px-12 py-4 font-display text-lg font-bold uppercase tracking-[0.3em] transition-all cursor-pointer ${lines >= BOOT.length ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-50 shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:shadow-[0_0_70px_rgba(34,211,238,0.7)] hover:bg-cyan-400/25' : 'border-slate-600/40 text-slate-500'}`}
            >
              <span className="shimmer absolute inset-0" />
              <span className="relative flex items-center gap-3">
                <Power size={20} /> Initialise Command Centre
              </span>
            </button>
            <p className="mt-4 font-mono text-[11px] text-slate-500">Presenter controls: Ctrl + Shift + P · Space play/pause · → next step · R reset · P phones</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
