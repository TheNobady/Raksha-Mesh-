import { BellRing, Drone, Megaphone, PenTool, RadioTower, ShieldAlert, Siren } from 'lucide-react'
import { sound } from '../../audio/soundManager'
import { SIRENS } from '../../data/infrastructure'
import { RESCUE_BASE } from '../../data/rescue'
import { useStore } from '../../store/scenarioStore'
import { GlowButton } from '../ui/GlowButton'

export function ActionPanel() {
  const s = useStore.getState
  const broadcast = useStore((st) => st.broadcastAt !== null)

  const actions = [
    {
      label: 'Draw Danger Zone', icon: PenTool, tone: 'cyan' as const,
      run: () => {
        s().set({ drawMode: 'polygon' })
        s().setScreen('composer')
      },
    },
    { label: 'Send Early Warning', icon: BellRing, tone: 'amber' as const, run: () => s().setScreen('composer') },
    {
      label: 'Issue Evacuation Order', icon: ShieldAlert, tone: 'rose' as const,
      run: () => {
        s().set({ severity: 'evacuate' })
        s().setScreen('composer')
      },
    },
    {
      label: 'Activate All Channels', icon: RadioTower, tone: 'green' as const,
      run: () => {
        sound.play('confirm')
        s().pushFeed('warn', 'channel', 'Emergency broadcast mode: all 10 channels armed for priority traffic')
        s().toast('warn', 'All channels armed', 'CB · SMS · IVR · FM · TV · Sirens · PA · SAT · Mesh')
        s().pulse([86.2, 20.3], [34, 197, 94], 120)
        if (broadcast) s().setScreen('routing')
      },
    },
    {
      label: 'Trigger Sirens', icon: Siren, tone: 'red' as const,
      run: () => {
        sound.play('siren')
        s().pushFeed('crit', 'channel', `Sirens triggered · ${SIRENS.length}/${SIRENS.length} coastal sirens sounding`)
        s().toast('crit', 'Sirens activated', `${SIRENS.length} coastal sirens sounding with voice playback`)
        SIRENS.slice(0, 14).forEach((x, i) => window.setTimeout(() => s().pulse(x.lngLat, [251, 191, 36], 14), i * 90))
      },
    },
    {
      label: 'Deploy Drones', icon: Drone, tone: 'cyan' as const,
      run: () => {
        sound.play('whoosh')
        s().pushFeed('info', 'rescue', 'Drones D-3, D-7 launched · thermal survey of Ersama & Mahakalapada')
        s().toast('info', 'Drones deployed', '2 thermal drones airborne')
        s().pulse([86.5, 20.25], [34, 211, 238], 30)
      },
    },
    {
      label: 'Request NDRF Support', icon: Megaphone, tone: 'amber' as const,
      run: () => {
        sound.play('confirm')
        s().pushFeed('warn', 'rescue', 'NDRF requisition sent · 6 additional teams from 3rd Bn Mundali')
        s().toast('warn', 'NDRF requested', '6 teams · ETA 2h 10m')
        s().pulse(RESCUE_BASE.at, [250, 204, 21], 40)
      },
    },
  ]

  return (
    <div className="glass brackets pointer-events-auto rounded-xl p-2">
      <span className="bk tl" />
      <span className="bk tr" />
      <span className="bk bl" />
      <span className="bk br" />
      <div className="mb-1.5 flex items-center gap-2 px-1">
        <ShieldAlert size={13} className="text-rose-300" />
        <span className="label text-rose-200">Early Threat Controls</span>
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-400 blink" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-1.5">
        {actions.map((a) => (
          <GlowButton key={a.label} icon={a.icon} tone={a.tone} size="sm" onClick={a.run} className="min-h-[34px] leading-tight text-center">
            {a.label}
          </GlowButton>
        ))}
      </div>
    </div>
  )
}
