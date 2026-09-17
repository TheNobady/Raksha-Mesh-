import { CloudRain, Gauge, Navigation, Tornado, Waves, Wind } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { CYCLONE } from '../../data/hazards'
import { landfallSeconds } from '../../lib/cyclone'
import { hms } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { GlassPanel } from '../ui/GlassPanel'

const WIND = [92, 104, 118, 131, 142, 150, 158, 166, 171, 176, 181, 185].map((v, i) => ({ i, v }))
const PRESSURE = [992, 988, 983, 977, 972, 968, 964, 961, 958, 956, 954, 952].map((v, i) => ({ i, v }))

function Spark({ data, color, id }: { data: { i: number; v: number }[]; color: string; id: string }) {
  return (
    <ResponsiveContainer width="100%" height={34}>
      <AreaChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.5} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} isAnimationActive animationDuration={1600} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function WeatherPanel() {
  const elapsed = useStore((s) => Math.floor(s.elapsed))
  const stats = [
    { icon: Wind, label: 'Max wind', value: `${CYCLONE.maxWindKmh} km/h`, sub: `gust ${CYCLONE.gustKmh}` },
    { icon: Gauge, label: 'Pressure', value: `${CYCLONE.pressureHpa} hPa`, sub: '▼ 4 hPa/3h' },
    { icon: Navigation, label: 'Movement', value: `${CYCLONE.movementDir} ${CYCLONE.movementKmh}`, sub: 'km/h' },
    { icon: CloudRain, label: 'Rainfall', value: `${CYCLONE.rainfallMm}`, sub: 'mm / 24h' },
    { icon: Waves, label: 'Storm surge', value: `${CYCLONE.surgeM} m`, sub: 'above tide' },
    { icon: Tornado, label: 'Eye diameter', value: '38 km', sub: 'well defined' },
  ]
  return (
    <GlassPanel title="Weather Report · IMD" icon={Tornado} live>
      <div className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-[15px] font-bold tracking-wider text-white whitespace-nowrap">Cyclone {CYCLONE.name}</div>
            <div className="mt-0.5 inline-flex rounded border border-rose-400/50 bg-rose-500/15 px-1.5 py-0.5 font-hud text-[10px] font-bold uppercase tracking-wider text-rose-200">
              {CYCLONE.category}
            </div>
          </div>
          <div className="text-right">
            <div className="font-hud text-[10px] uppercase tracking-widest text-slate-400">Landfall in</div>
            <div className="num text-lg text-rose-300 text-glow-red">{hms(landfallSeconds(elapsed))}</div>
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border border-sky-400/10 bg-slate-950/40 px-2 py-1.5">
              <div className="flex items-center gap-1 text-slate-400">
                <s.icon size={11} className="text-cyan-400" />
                <span className="font-hud text-[9.5px] uppercase tracking-wider truncate">{s.label}</span>
              </div>
              <div className="font-mono text-[12.5px] font-bold text-slate-100 truncate">{s.value}</div>
              <div className="font-mono text-[9.5px] text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between font-hud text-[10px] uppercase tracking-wider text-slate-400">
              <span>Wind trend</span>
              <span className="text-amber-300">▲ 12%</span>
            </div>
            <Spark data={WIND} color="#F59E0B" id="spark-wind" />
          </div>
          <div>
            <div className="flex justify-between font-hud text-[10px] uppercase tracking-wider text-slate-400">
              <span>Pressure trend</span>
              <span className="text-rose-300">▼ 40</span>
            </div>
            <Spark data={PRESSURE} color="#F43F5E" id="spark-pressure" />
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
