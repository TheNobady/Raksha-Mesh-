export function LiveTag({ label = 'LIVE', color = 'red' }: { label?: string; color?: 'red' | 'green' | 'cyan' }) {
  const c = color === 'red' ? 'bg-red-500 text-red-300' : color === 'green' ? 'bg-green-400 text-green-300' : 'bg-cyan-400 text-cyan-300'
  const [dot, text] = c.split(' ')
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} blink shadow-[0_0_6px_currentColor]`} />
      {label}
    </span>
  )
}
