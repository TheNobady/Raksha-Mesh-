/** Canvas-generated icon atlas (no external images needed). */

export const ICON_SIZE = 128

type Draw = (c: CanvasRenderingContext2D, s: number) => void

const draws: Record<string, Draw> = {
  cyclone: (c, s) => {
    const cx = s / 2
    const g = c.createRadialGradient(cx, cx, 0, cx, cx, cx)
    g.addColorStop(0, 'rgba(255,255,255,0.0)')
    g.addColorStop(0.08, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.16, 'rgba(186,230,253,0.65)')
    g.addColorStop(0.55, 'rgba(125,211,252,0.28)')
    g.addColorStop(1, 'rgba(56,189,248,0)')
    c.fillStyle = g
    c.beginPath()
    c.arc(cx, cx, cx, 0, Math.PI * 2)
    c.fill()
    // spiral arms
    for (let arm = 0; arm < 4; arm++) {
      c.beginPath()
      for (let t = 0; t < 1; t += 0.01) {
        const a = arm * (Math.PI / 2) + t * Math.PI * 2.2
        const r = cx * 0.1 + t * cx * 0.88
        const x = cx + Math.cos(a) * r
        const y = cx + Math.sin(a) * r
        if (t === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.strokeStyle = `rgba(240,249,255,${0.75 - arm * 0.08})`
      c.lineWidth = s * 0.055
      c.lineCap = 'round'
      c.shadowColor = 'rgba(125,211,252,0.9)'
      c.shadowBlur = s * 0.05
      c.stroke()
    }
    // eye
    c.shadowBlur = 0
    c.fillStyle = 'rgba(3,7,18,0.95)'
    c.beginPath()
    c.arc(cx, cx, s * 0.05, 0, Math.PI * 2)
    c.fill()
  },
  boat: (c, s) => {
    c.translate(s / 2, s / 2)
    c.fillStyle = '#F97316'
    c.strokeStyle = '#FFF7ED'
    c.lineWidth = s * 0.04
    c.beginPath()
    c.moveTo(0, -s * 0.4)
    c.quadraticCurveTo(s * 0.22, -s * 0.1, s * 0.18, s * 0.38)
    c.lineTo(-s * 0.18, s * 0.38)
    c.quadraticCurveTo(-s * 0.22, -s * 0.1, 0, -s * 0.4)
    c.fill()
    c.stroke()
    c.fillStyle = '#FFF7ED'
    c.fillRect(-s * 0.08, -s * 0.05, s * 0.16, s * 0.2)
  },
  heli: (c, s) => {
    c.translate(s / 2, s / 2)
    c.fillStyle = '#E2E8F0'
    c.beginPath()
    c.ellipse(0, 0, s * 0.12, s * 0.2, 0, 0, Math.PI * 2)
    c.fill()
    c.fillRect(-s * 0.025, s * 0.15, s * 0.05, s * 0.28)
    c.strokeStyle = 'rgba(226,232,240,0.85)'
    c.lineWidth = s * 0.035
    c.beginPath()
    c.moveTo(-s * 0.42, -s * 0.42)
    c.lineTo(s * 0.42, s * 0.42)
    c.moveTo(s * 0.42, -s * 0.42)
    c.lineTo(-s * 0.42, s * 0.42)
    c.stroke()
  },
  drone: (c, s) => {
    c.translate(s / 2, s / 2)
    c.strokeStyle = '#22D3EE'
    c.lineWidth = s * 0.06
    c.beginPath()
    c.moveTo(-s * 0.28, -s * 0.28)
    c.lineTo(s * 0.28, s * 0.28)
    c.moveTo(s * 0.28, -s * 0.28)
    c.lineTo(-s * 0.28, s * 0.28)
    c.stroke()
    c.fillStyle = '#22D3EE'
    ;[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([x, y]) => {
      c.beginPath()
      c.arc(x * s * 0.3, y * s * 0.3, s * 0.12, 0, Math.PI * 2)
      c.globalAlpha = 0.45
      c.fill()
      c.globalAlpha = 1
    })
    c.fillStyle = '#ECFEFF'
    c.fillRect(-s * 0.1, -s * 0.1, s * 0.2, s * 0.2)
  },
  ndrf: (c, s) => {
    c.translate(s / 2, s / 2)
    c.fillStyle = '#FACC15'
    c.strokeStyle = '#111827'
    c.lineWidth = s * 0.04
    c.beginPath()
    c.roundRect(-s * 0.36, -s * 0.2, s * 0.72, s * 0.4, s * 0.08)
    c.fill()
    c.stroke()
    c.fillStyle = '#111827'
    c.font = `bold ${s * 0.2}px sans-serif`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText('NDRF', 0, 0)
  },
  blocked: (c, s) => {
    c.translate(s / 2, s / 2)
    c.fillStyle = '#EF4444'
    c.beginPath()
    c.arc(0, 0, s * 0.4, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#FFF'
    c.fillRect(-s * 0.26, -s * 0.07, s * 0.52, s * 0.14)
  },
}

type IconDef = { x: number; y: number; width: number; height: number; anchorY: number; mask: boolean }
let atlas: { canvas: HTMLCanvasElement; mapping: Record<string, IconDef> } | null = null

export function getIconAtlas() {
  if (atlas) return atlas
  const names = Object.keys(draws)
  const canvas = document.createElement('canvas')
  canvas.width = ICON_SIZE * names.length
  canvas.height = ICON_SIZE
  const ctx = canvas.getContext('2d')!
  const mapping: Record<string, IconDef> = {}
  names.forEach((n, i) => {
    ctx.save()
    ctx.translate(i * ICON_SIZE, 0)
    draws[n](ctx, ICON_SIZE)
    ctx.restore()
    mapping[n] = { x: i * ICON_SIZE, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: false }
  })
  atlas = { canvas, mapping }
  return atlas
}
