import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/scenarioStore'

const W = 560
const H = 250

const PHONES: [number, number][] = [
  [60, 150], [110, 110], [120, 190], [175, 145], [200, 80], [220, 205], [265, 120], [290, 175], [330, 85], [345, 215], [380, 140],
]
// BFS-ish order of links from the source phone (index 0)
const LINKS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [3, 6], [2, 5], [4, 6], [6, 7], [5, 7], [4, 8], [7, 9], [6, 10], [8, 10], [9, 10],
]
const ROAD_PTS: [number, number][] = [[380, 140], [405, 136], [428, 116], [448, 98], [470, 94], [490, 104], [505, 128], [520, 150]]
const ROAD = 'M ' + ROAD_PTS.map((p) => p.join(' ')).join(' L ')

function along(f: number): [number, number] {
  const seg = ROAD_PTS.slice(1).map((p, i) => Math.hypot(p[0] - ROAD_PTS[i][0], p[1] - ROAD_PTS[i][1]))
  let d = f * seg.reduce((a, b) => a + b, 0)
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const k = d / seg[i]
      return [ROAD_PTS[i][0] + (ROAD_PTS[i + 1][0] - ROAD_PTS[i][0]) * k, ROAD_PTS[i][1] + (ROAD_PTS[i + 1][1] - ROAD_PTS[i][1]) * k]
    }
    d -= seg[i]
  }
  return ROAD_PTS[ROAD_PTS.length - 1]
}
const TOWERS: [number, number][] = [[140, 40], [300, 36], [430, 200]]

export function MeshVisual() {
  const phase = useStore((s) => s.failoverPhase)
  const active = phase >= 3
  const [t, setT] = useState(0)
  const start = useRef(0)

  useEffect(() => {
    if (!active) {
      setT(0)
      return
    }
    let raf = 0
    let last = 0
    start.current = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      setT(((now - start.current) / 1000) % 16)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const linksShown = active ? Math.min(LINKS.length, Math.floor(t / 0.45)) : 0
  const reached = new Set<number>([0])
  LINKS.slice(0, linksShown).forEach(([a, b]) => {
    reached.add(a)
    reached.add(b)
  })
  const busT = Math.max(0, Math.min(1, (t - 8) / 4.5))
  const villageLit = t > 12.5

  return (
    <div className="relative h-full w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <defs>
          <radialGradient id="mesh-bg" cx="0.4" cy="0.5" r="0.7">
            <stop offset="0" stopColor="#0B2540" />
            <stop offset="1" stopColor="#030712" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#mesh-bg)" rx="10" />
        {/* fields / houses */}
        {Array.from({ length: 26 }).map((_, i) => (
          <rect key={i} x={(i * 97) % 400 + 20} y={(i * 53) % 200 + 20} width="10" height="8" rx="1.5" fill="#1E293B" opacity="0.8" />
        ))}
        {/* water */}
        <path d="M0 230 Q 120 210 240 238 T 560 225 L560 250 L0 250 Z" fill="#0C2D55" opacity="0.7" />

        {/* dead towers */}
        {TOWERS.map(([x, y], i) => (
          <g key={i} opacity="0.85">
            <path d={`M${x} ${y + 26} L${x - 7} ${y + 26} L${x} ${y - 4} L${x + 7} ${y + 26} Z`} fill="none" stroke="#64748B" strokeWidth="1.5" />
            <line x1={x - 9} y1={y - 8} x2={x + 9} y2={y + 8} stroke="#EF4444" strokeWidth="2" />
            <line x1={x + 9} y1={y - 8} x2={x - 9} y2={y + 8} stroke="#EF4444" strokeWidth="2" />
            <text x={x} y={y + 38} textAnchor="middle" fontSize="8" fill="#F87171" fontFamily="JetBrains Mono">NO SIGNAL</text>
          </g>
        ))}

        {/* road to cut-off village */}
        <path d={ROAD} fill="none" stroke="#334155" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d={ROAD} fill="none" stroke="#64748B" strokeWidth="1" strokeDasharray="5 6" />

        {/* mesh links */}
        {LINKS.slice(0, linksShown).map(([a, b], i) => (
          <g key={i}>
            <line x1={PHONES[a][0]} y1={PHONES[a][1]} x2={PHONES[b][0]} y2={PHONES[b][1]} stroke="#2DD4BF" strokeWidth="1.6" opacity="0.8" />
            <circle r="3" fill="#CCFBF1">
              <animateMotion dur="0.9s" repeatCount="indefinite" path={`M${PHONES[a][0]},${PHONES[a][1]} L${PHONES[b][0]},${PHONES[b][1]}`} />
            </circle>
          </g>
        ))}

        {/* phones */}
        {PHONES.map(([x, y], i) => {
          const on = reached.has(i) && active
          return (
            <g key={i}>
              {on && (
                <circle cx={x} cy={y} r="10" fill="none" stroke="#5EEAD4" strokeWidth="1">
                  <animate attributeName="r" values="6;16;6" dur="2s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
                </circle>
              )}
              <rect x={x - 5} y={y - 8} width="10" height="16" rx="2" fill={on ? '#0F766E' : '#1E293B'} stroke={i === 0 && active ? '#FDE68A' : on ? '#5EEAD4' : '#475569'} strokeWidth={i === 0 ? 2 : 1.2} />
              <rect x={x - 3} y={y - 5} width="6" height="8" rx="1" fill={on ? '#99F6E4' : '#334155'} />
            </g>
          )
        })}
        {active && <text x={PHONES[0][0]} y={PHONES[0][1] + 22} textAnchor="middle" fontSize="8" fill="#FDE68A" fontFamily="JetBrains Mono">SOURCE</text>}

        {/* bus carrying the message */}
        {active && busT > 0 && busT < 1 && (
          <g>
            <g transform={`translate(${along(busT)[0]} ${along(busT)[1]})`}>
              <rect x="-11" y="-6" width="22" height="12" rx="3" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1" />
              <rect x="-7" y="-3" width="5" height="4" fill="#FEF3C7" />
              <rect x="1" y="-3" width="5" height="4" fill="#FEF3C7" />
              <circle r="14" fill="none" stroke="#5EEAD4" strokeOpacity="0.6">
                <animate attributeName="r" values="8;18;8" dur="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        )}

        {/* cut-off village */}
        <g transform="translate(520 150)">
          {villageLit && (
            <circle r="30" fill="#22C55E" opacity="0.18">
              <animate attributeName="r" values="18;34;18" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          {[[-14, -8], [0, -14], [12, -4], [-6, 8], [10, 10]].map(([dx, dy], i) => (
            <path key={i} d={`M${dx - 6} ${dy + 5} L${dx - 6} ${dy - 1} L${dx} ${dy - 6} L${dx + 6} ${dy - 1} L${dx + 6} ${dy + 5} Z`} fill={villageLit ? '#4ADE80' : '#334155'} stroke={villageLit ? '#DCFCE7' : '#475569'} strokeWidth="1" />
          ))}
          <text y="34" textAnchor="middle" fontSize="9" fill={villageLit ? '#86EFAC' : '#94A3B8'} fontFamily="Rajdhani" fontWeight="700">
            {villageLit ? 'KANTIAPADA · REACHED' : 'CUT-OFF VILLAGE'}
          </text>
        </g>
      </svg>
      <div className="absolute left-3 top-2 rounded bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] text-teal-300 ring-1 ring-teal-400/30">
        Offline relay · No internet · No towers
      </div>
      <div className="absolute bottom-2 left-3 font-mono text-[10px] text-slate-400">
        {active ? `${reached.size}/${PHONES.length} phones · ${linksShown} hops${busT > 0 ? ' · bus carrier en route' : ''}` : 'Mesh standby · awaiting alert'}
      </div>
    </div>
  )
}
