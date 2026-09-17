export function Logo({ size = 36, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]">
      <defs>
        <linearGradient id="lg-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E2A4A" />
          <stop offset="1" stopColor="#061224" />
        </linearGradient>
        <linearGradient id="lg-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67E8F9" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <path d="M32 4 56 13v17c0 15-10 26-24 30C18 56 8 45 8 30V13z" fill="url(#lg-shield)" stroke="url(#lg-edge)" strokeWidth="2.5" />
      <g stroke="#4ADE80" strokeWidth="1.6" opacity="0.9">
        <line x1="20" y1="24" x2="44" y2="24" />
        <line x1="20" y1="24" x2="32" y2="44" />
        <line x1="44" y1="24" x2="32" y2="44" />
        <line x1="32" y1="14" x2="20" y2="24" />
        <line x1="32" y1="14" x2="44" y2="24" />
        <line x1="32" y1="14" x2="32" y2="31" />
        <line x1="20" y1="24" x2="32" y2="31" />
        <line x1="44" y1="24" x2="32" y2="31" />
        <line x1="32" y1="31" x2="32" y2="44" />
      </g>
      {[
        [32, 14], [20, 24], [44, 24], [32, 31], [32, 44],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 3.6 : 2.8} fill={i === 3 ? '#4ADE80' : '#22D3EE'}>
          {animated && <animate attributeName="r" values={`${i === 3 ? 3.6 : 2.8};${i === 3 ? 5 : 3.8};${i === 3 ? 3.6 : 2.8}`} dur={`${1.4 + i * 0.25}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </svg>
  )
}
