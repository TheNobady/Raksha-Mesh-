const COLORS = {
  green: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]',
  red: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.95)]',
  amber: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]',
  cyan: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]',
  grey: 'bg-slate-500',
}

export function StatusDot({ color, pulse = true, size = 8 }: { color: keyof typeof COLORS; pulse?: boolean; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {pulse && color !== 'grey' && <span className={`absolute inset-0 rounded-full ping-ring opacity-60 ${COLORS[color].split(' ')[0]}`} />}
      <span className={`relative inline-flex rounded-full w-full h-full ${COLORS[color]}`} />
    </span>
  )
}
