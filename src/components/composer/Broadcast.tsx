import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Radio, Send, ShieldCheck, UserCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sound } from '../../audio/soundManager'
import { istClock } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'

export function ApprovalModal() {
  const open = useStore((s) => s.approvalOpen)
  const set = useStore((s) => s.set)
  const [stage, setStage] = useState<'sending' | 'approved'>('sending')
  const [time, setTime] = useState('')

  useEffect(() => {
    if (!open) return
    setStage('sending')
    const t = window.setTimeout(() => {
      setStage('approved')
      setTime(istClock())
      sound.play('success')
      useStore.getState().pushFeed('ok', 'alert', 'Alert approved by Additional District Magistrate · two-person rule satisfied')
    }, 1600)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-auto fixed inset-0 z-[120] grid place-items-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-strong brackets w-[440px] rounded-2xl p-6 text-center">
            <span className="bk tl" />
            <span className="bk tr" />
            <span className="bk bl" />
            <span className="bk br" />
            <div className="label">Two-person authorisation</div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 font-hud font-bold text-white">DC</div>
                <span className="mt-1 text-[11px] text-slate-400">District Control Officer</span>
              </div>
              <div className="relative h-px w-20 bg-gradient-to-r from-cyan-400 to-green-400">
                <motion.span animate={{ x: [0, 76, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute -top-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
              </div>
              <div className="flex flex-col items-center">
                <div className={`relative grid h-14 w-14 place-items-center rounded-full font-hud font-bold text-white ${stage === 'approved' ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-slate-700'}`}>
                  ADM
                  {stage === 'approved' && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center rounded-full bg-green-400 text-slate-950 shadow-[0_0_12px_rgba(74,222,128,0.9)]">
                      <Check size={14} strokeWidth={3} />
                    </motion.span>
                  )}
                </div>
                <span className="mt-1 text-[11px] text-slate-400">Additional District Magistrate</span>
              </div>
            </div>

            <div className="mt-6 h-24">
              {stage === 'sending' ? (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <Loader2 size={30} className="spin text-cyan-300" />
                  <span className="text-sm">Awaiting approval from ADM (Relief)…</span>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <motion.circle cx="28" cy="28" r="25" fill="none" stroke="#4ADE80" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                    <motion.path d="M17 29 L25 37 L40 20" fill="none" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.4 }} />
                  </svg>
                  <div className="mt-1 font-hud text-lg font-bold uppercase tracking-widest text-green-300 text-glow-green">Approved</div>
                  <div className="font-mono text-[11px] text-slate-400">Smt. R. Mohapatra, ADM · {time} IST · sig 0x9f3a…c21e</div>
                </motion.div>
              )}
            </div>

            <button
              disabled={stage !== 'approved'}
              onClick={() => set({ approvalOpen: false, approved: true })}
              className="mt-4 w-full rounded-lg border border-green-400/50 bg-green-500/15 py-2.5 font-hud text-sm font-bold uppercase tracking-widest text-green-100 disabled:opacity-30 cursor-pointer hover:bg-green-500/25"
            >
              <UserCheck size={15} className="mr-2 inline" /> Continue to broadcast
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function BroadcastControls() {
  const approved = useStore((s) => s.approved)
  const zone = useStore((s) => s.zone)
  const broadcastAt = useStore((s) => s.broadcastAt)
  const set = useStore((s) => s.set)
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)
  const start = useRef(0)

  const begin = () => {
    if (!approved || broadcastAt !== null) return
    start.current = performance.now()
    sound.play('click')
    const step = (now: number) => {
      const p = Math.min(1, (now - start.current) / 1200)
      setProgress(p)
      if (p >= 1) {
        useStore.getState().broadcast()
        setProgress(0)
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }
  const cancel = () => {
    cancelAnimationFrame(raf.current)
    setProgress(0)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const C = 2 * Math.PI * 40

  return (
    <div className="px-4 py-4">
      {!approved ? (
        <button
          onClick={() => {
            if (!zone) useStore.getState().suggestZone()
            set({ approvalOpen: true })
            sound.play('confirm')
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/15 py-3 font-hud text-base font-bold uppercase tracking-[0.2em] text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:bg-amber-500/25 cursor-pointer"
        >
          <Send size={18} /> Send for approval
        </button>
      ) : broadcastAt !== null ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-green-400/50 bg-green-500/10 py-3 font-hud font-bold uppercase tracking-widest text-green-200">
          <Check size={18} /> Alert broadcast
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onPointerDown={begin}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            className="relative grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full cursor-pointer select-none"
          >
            <svg className="absolute inset-0" viewBox="0 0 104 104">
              <circle cx="52" cy="52" r="40" fill="none" stroke="rgba(244,63,94,0.25)" strokeWidth="6" />
              <circle cx="52" cy="52" r="40" fill="none" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 52 52)" style={{ filter: 'drop-shadow(0 0 8px #F43F5E)' }} />
            </svg>
            <span className="absolute inset-3 rounded-full bg-gradient-to-br from-rose-500 to-red-700 shadow-[0_0_40px_rgba(244,63,94,0.7)] ping-ring opacity-30" />
            <span className="relative grid h-[76px] w-[76px] place-items-center rounded-full bg-gradient-to-br from-rose-500 to-red-700 shadow-[0_0_30px_rgba(244,63,94,0.8),inset_0_2px_0_rgba(255,255,255,0.3)]" style={{ transform: `scale(${1 - progress * 0.08})` }}>
              <Radio size={30} className="text-white" />
            </span>
          </button>
          <div>
            <div className="font-display text-xl font-bold tracking-[0.15em] text-rose-100 text-glow-red">BROADCAST ALERT</div>
            <div className="mt-1 text-[12px] text-slate-400">Press &amp; hold to confirm · all channels · signed</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-green-300">
              <ShieldCheck size={12} /> Approved by ADM · ready
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
