import { BatteryMedium, Signal, WifiOff } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { istShort } from '../../lib/format'

export function useClock() {
  const [t, setT] = useState(istShort())
  useEffect(() => {
    const i = window.setInterval(() => setT(istShort()), 5000)
    return () => window.clearInterval(i)
  }, [])
  return t
}

export function SmartFrame({ children, shake, accent = '#0b0f19' }: { children: ReactNode; shake?: boolean; accent?: string }) {
  const time = useClock()
  return (
    <div className={`relative h-[500px] w-[244px] rounded-[40px] p-[9px] shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(148,163,184,0.25),inset_0_0_0_2px_rgba(255,255,255,0.06)] ${shake ? 'shake' : ''}`} style={{ background: `linear-gradient(145deg, #2a3140, ${accent} 40%, #05070c)` }}>
      <span className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-slate-600" />
      <span className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l bg-slate-600" />
      <span className="absolute -right-[3px] top-28 h-16 w-[3px] rounded-r bg-slate-600" />
      <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-black">
        <div className="absolute left-1/2 top-2 z-30 h-[14px] w-[14px] -translate-x-1/2 rounded-full bg-black ring-2 ring-slate-800" />
        <div className="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between px-5 pt-1 text-[10.5px] font-semibold text-white">
          <span>{time}</span>
          <span className="flex items-center gap-1">
            <Signal size={11} className="opacity-60" />
            <WifiOff size={11} className="text-red-300" />
            <BatteryMedium size={13} />
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
