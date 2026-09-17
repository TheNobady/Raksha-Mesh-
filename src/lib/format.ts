const inr = new Intl.NumberFormat('en-IN')

/** 124380 -> "1,24,380" */
export const fmtIN = (n: number) => inr.format(Math.round(n))

/** 420000 -> "4.2 Lakh", 12000000 -> "1.2 Crore" */
export function fmtCompact(n: number) {
  if (n >= 1e7) return `${trim(n / 1e7)} Crore`
  if (n >= 1e5) return `${trim(n / 1e5)} Lakh`
  return fmtIN(n)
}

const trim = (v: number) => (v >= 10 ? v.toFixed(1) : v.toFixed(1)).replace(/\.0$/, '')

export const pct = (a: number, b: number) => (b <= 0 ? 0 : Math.round((a / b) * 100))

export function istClock(d = new Date()) {
  return d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false })
}

export function istShort(d = new Date()) {
  return istClock(d).slice(0, 5)
}

export function istDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function hms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':')
}
