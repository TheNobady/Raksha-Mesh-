import { Crosshair, Flame, MapPinPlus, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { istClock } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'

const NORMAL = { water: '#123243', water2: '#1d506b', roof: '#6d5340', roof2: '#4d3b2d', tin: '#6e7c88', tree: '#255030', road: '#3d4a55', person: '#e8c9a0', mud: '#2c2a26' }
const THERMAL = { water: '#1a0636', water2: '#2b0a52', roof: '#4b1d78', roof2: '#3a1466', tin: '#5a2a8a', tree: '#3d0f5e', road: '#521f7a', person: '#ffe066', mud: '#34105a' }

const HOUSES = [
  { x: 70, y: 60, w: 70, h: 52, tin: false },
  { x: 180, y: 40, w: 90, h: 64, tin: true },
  { x: 330, y: 70, w: 64, h: 48, tin: false },
  { x: 110, y: 170, w: 84, h: 60, tin: true },
  { x: 250, y: 150, w: 110, h: 76, tin: false }, // target rooftop
  { x: 420, y: 180, w: 70, h: 54, tin: true },
  { x: 40, y: 250, w: 60, h: 46, tin: false },
]
const PEOPLE = [
  { x: 282, y: 178, conf: 97 },
  { x: 306, y: 192, conf: 94 },
  { x: 326, y: 176, conf: 89 },
]

export function DroneView() {
  const [thermal, setThermal] = useState(false)
  const detected = useStore((s) => s.droneDetected)
  const marked = useStore((s) => s.droneMarked)
  const mark = useStore((s) => s.markForRescue)
  const [clock, setClock] = useState(istClock())
  useEffect(() => {
    const t = window.setInterval(() => setClock(istClock()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const c = thermal ? THERMAL : NORMAL

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
      <svg viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" className="drone-pan absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="heatblob">
            <stop offset="0" stopColor="#fff7c2" />
            <stop offset="0.35" stopColor="#ffd23f" />
            <stop offset="0.7" stopColor="#ff7b00" />
            <stop offset="1" stopColor="#ff2d55" stopOpacity="0" />
          </radialGradient>
          <pattern id="tin" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill={c.tin} />
            <rect width="2" height="6" fill={c.roof2} opacity="0.35" />
          </pattern>
        </defs>
        <rect width="520" height="320" fill={c.water} />
        {/* currents */}
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M ${-40 + ((i * 61) % 560)} ${(i * 37) % 320} q 20 -6 40 0 t 40 0`} stroke={c.water2} strokeWidth="2" fill="none" opacity="0.8">
            <animateTransform attributeName="transform" type="translate" values="0 0; 30 4; 0 0" dur={`${6 + (i % 4)}s`} repeatCount="indefinite" />
          </path>
        ))}
        {/* submerged road */}
        <path d="M -10 290 C 120 250, 220 300, 540 240" stroke={c.road} strokeWidth="22" fill="none" opacity="0.35" />
        <path d="M -10 290 C 120 250, 220 300, 540 240" stroke={c.water} strokeWidth="8" strokeDasharray="14 12" fill="none" opacity="0.5" />
        {/* trees */}
        {[[30, 30], [160, 130], [400, 40], [470, 110], [220, 260], [380, 280], [20, 180], [500, 280]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="18" fill={c.tree} />
            <circle cx={x + 8} cy={y - 6} r="12" fill={c.tree} opacity="0.8" />
          </g>
        ))}
        {/* houses */}
        {HOUSES.map((h, i) => (
          <g key={i}>
            <rect x={h.x - 5} y={h.y - 5} width={h.w + 10} height={h.h + 10} fill={c.mud} opacity="0.5" rx="3" />
            <rect x={h.x} y={h.y} width={h.w} height={h.h} fill={h.tin ? 'url(#tin)' : c.roof} stroke={c.roof2} strokeWidth="2" />
            <line x1={h.x} y1={h.y + h.h / 2} x2={h.x + h.w} y2={h.y + h.h / 2} stroke={c.roof2} strokeWidth="2" />
            {/* ripples around walls */}
            {i < 3 && (
              <rect x={h.x - 5} y={h.y - 5} width={h.w + 10} height={h.h + 10} fill="none" stroke={thermal ? '#6d28d9' : '#9cc7d8'} strokeOpacity="0.5" rx="4">
                <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
              </rect>
            )}
          </g>
        ))}
        {/* people on the rooftop */}
        {PEOPLE.map((p, i) =>
          thermal ? (
            <g key={i}>
              <ellipse cx={p.x} cy={p.y} rx="13" ry="18" fill="url(#heatblob)" />
              <circle cx={p.x} cy={p.y - 9} r="5" fill="#fff3b0" opacity="0.9" />
            </g>
          ) : (
            <g key={i}>
              <circle cx={p.x} cy={p.y - 6} r="3.5" fill="#3b2a20" />
              <ellipse cx={p.x} cy={p.y + 2} rx="5" ry="7" fill={i === 1 ? '#c2410c' : '#1d4ed8'} />
            </g>
          ),
        )}
      </svg>

      {/* thermal colour grade */}
      {thermal && <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fuchsia-900/10 via-transparent to-orange-500/10 mix-blend-screen" />}

      {/* targeting boxes */}
      {(detected || thermal) && (
        <div className="pointer-events-none absolute inset-0">
          {PEOPLE.map((p, i) => (
            <div
              key={i}
              className="absolute border-2 border-yellow-300 target-pop"
              style={{ left: `${((p.x - 18) / 520) * 100}%`, top: `${((p.y - 24) / 320) * 100}%`, width: `${(36 / 520) * 100}%`, height: `${(46 / 320) * 100}%`, boxShadow: '0 0 10px rgba(253,224,71,0.7)' }}
            >
              <span className="absolute -top-4 left-0 whitespace-nowrap bg-yellow-300 px-1 font-mono text-[9px] font-bold text-black">PERSON {p.conf}%</span>
            </div>
          ))}
        </div>
      )}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 font-mono text-[10.5px] text-green-300">
        <div className="scan-sweep absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-green-300/15 to-transparent" />
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 blink" /> REC · D-3 {thermal ? 'THERMAL' : 'EO'} · {clock}
        </div>
        <div className="absolute right-2 top-2 text-right">
          ALT 120 m · SPD 8 m/s
          <br />
          BAT 76% · LINK −71 dBm
        </div>
        <div className="absolute left-1/2 top-2 flex -translate-x-1/2 gap-3 text-green-400/80">
          {['W', '285', '300', 'NW', '330', '345', 'N'].map((d) => (
            <span key={d} className={d === 'NW' ? 'text-green-200' : ''}>
              {d}
            </span>
          ))}
        </div>
        <Crosshair size={46} strokeWidth={1} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green-300/70" />
        <div className="absolute bottom-2 left-2">20.2412°N 86.5018°E · Sialia, Jagatsinghpur</div>
        {detected && (
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 rounded bg-red-600/90 px-3 py-1 font-hud text-[13px] font-bold tracking-[0.2em] text-white blink shadow-[0_0_20px_rgba(239,68,68,0.8)]">
            PERSON DETECTED — 3
          </div>
        )}
        {['left-1 top-1 border-l-2 border-t-2', 'right-1 top-1 border-r-2 border-t-2', 'left-1 bottom-1 border-l-2 border-b-2', 'right-1 bottom-1 border-r-2 border-b-2'].map((c) => (
          <span key={c} className={`absolute h-5 w-5 border-green-300/70 ${c}`} />
        ))}
      </div>

      {/* controls */}
      <div className="absolute bottom-2 right-2 flex gap-1.5">
        <div className="flex overflow-hidden rounded-md border border-green-400/40 bg-black/60">
          <button onClick={() => setThermal(false)} className={`flex items-center gap-1 px-2 py-1 font-hud text-[10.5px] font-bold uppercase cursor-pointer ${!thermal ? 'bg-green-500/25 text-green-100' : 'text-green-400/70'}`}>
            <Video size={11} /> Normal
          </button>
          <button onClick={() => setThermal(true)} className={`flex items-center gap-1 px-2 py-1 font-hud text-[10.5px] font-bold uppercase cursor-pointer ${thermal ? 'bg-orange-500/30 text-orange-100' : 'text-green-400/70'}`}>
            <Flame size={11} /> Thermal
          </button>
        </div>
        <button
          onClick={mark}
          disabled={marked}
          className="flex items-center gap-1 rounded-md border border-red-400/60 bg-red-600/80 px-2.5 py-1 font-hud text-[10.5px] font-bold uppercase tracking-wider text-white shadow-[0_0_14px_rgba(239,68,68,0.6)] disabled:bg-green-700/80 disabled:border-green-400/60 cursor-pointer"
        >
          <MapPinPlus size={12} /> {marked ? 'Marked · on board' : 'Mark for rescue'}
        </button>
      </div>
    </div>
  )
}
