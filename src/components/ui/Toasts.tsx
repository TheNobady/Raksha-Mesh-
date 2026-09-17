import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, Siren } from 'lucide-react'
import { useStore } from '../../store/scenarioStore'

const STYLE = {
  info: { icon: Info, cls: 'border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.25)]', ic: 'text-cyan-300' },
  ok: { icon: CheckCircle2, cls: 'border-green-400/50 shadow-[0_0_24px_rgba(74,222,128,0.3)]', ic: 'text-green-300' },
  warn: { icon: AlertTriangle, cls: 'border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.3)]', ic: 'text-amber-300' },
  crit: { icon: Siren, cls: 'border-red-400/60 shadow-[0_0_28px_rgba(239,68,68,0.4)]', ic: 'text-red-300' },
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const st = STYLE[t.sev]
          const Icon = st.icon
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              onClick={() => dismiss(t.id)}
              className={`pointer-events-auto glass-strong flex min-w-[320px] items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer ${st.cls}`}
            >
              <Icon size={20} className={st.ic} />
              <div>
                <div className="font-hud text-sm font-bold uppercase tracking-wider text-white">{t.title}</div>
                {t.body && <div className="text-xs text-slate-300">{t.body}</div>}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
