import { DISTRICTS } from '../../data/geography'
import { TOWERS } from '../../data/infrastructure'
import { useStore } from '../../store/scenarioStore'

const BOUNDS = { minX: 84.0, maxX: 87.7, minY: 19.0, maxY: 22.6 }
const W = 220
const H = 200
const px = (lng: number) => ((lng - BOUNDS.minX) / (BOUNDS.maxX - BOUNDS.minX)) * W
const py = (lat: number) => H - ((lat - BOUNDS.minY) / (BOUNDS.maxY - BOUNDS.minY)) * H
const odisha = TOWERS.filter((t) => t.region === 'odisha')

export function TowerThumb() {
  const down = useStore((s) => s.towersDown)
  const n = Object.keys(down).length
  return (
    <div className="flex h-full gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full max-h-[190px] shrink-0">
        {DISTRICTS.map((d) => (
          <polygon key={d.id} points={d.ring.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} fill="rgba(34,211,238,0.05)" stroke="rgba(56,189,248,0.35)" strokeWidth="0.8" />
        ))}
        {odisha.map((t) => (
          <circle key={t.id} cx={px(t.lngLat[0])} cy={py(t.lngLat[1])} r={down[t.id] ? 2.8 : 1.8} fill={down[t.id] ? '#EF4444' : '#4ADE80'} opacity={down[t.id] ? 1 : 0.7}>
            {down[t.id] && <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />}
          </circle>
        ))}
      </svg>
      <div className="flex flex-col justify-center gap-2 font-mono text-[11px]">
        <div>
          <div className="text-slate-500">Towers online</div>
          <div className="num text-lg text-green-300">{odisha.length - n}</div>
        </div>
        <div>
          <div className="text-slate-500">Towers down</div>
          <div className="num text-lg text-red-400 text-glow-red">{n}</div>
        </div>
        <div>
          <div className="text-slate-500">Worst hit</div>
          <div className="text-slate-200">Ersama · Kujang</div>
        </div>
      </div>
    </div>
  )
}
