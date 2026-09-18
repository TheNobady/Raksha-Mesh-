import { BellRing, ClipboardCheck, Drone, Megaphone, PenTool, RadioTower, ShieldAlert, Siren, UsersRound, Waves, Zap } from 'lucide-react'
import { sound } from '../../audio/soundManager'
import { SIRENS } from '../../data/infrastructure'
import { RESCUE_BASE } from '../../data/rescue'
import { useStore } from '../../store/scenarioStore'
import { GlowButton } from '../ui/GlowButton'

export function ActionPanel() {
  const s = useStore.getState
  const broadcast = useStore((st) => st.broadcastAt !== null)
  const calm = useStore((st) => st.phase === 'calm')

  // Standby: readiness drills, plus the one button that starts the scenario.
  const calmActions = [
    {
      label: 'Run Channel Test', icon: RadioTower, tone: 'cyan' as const,
      run: () => {
        sound.play('confirm')
        s().pushFeed('ok', 'channel', 'Channel test complete · CB, SMS, IVR, FM, TV, sirens, PA, satellite, mesh all responded')
        s().toast('ok', 'Channel test passed', 'All 10 paths acknowledged within SLA')
      },
    },
    {
      label: 'Siren Self-Test', icon: Siren, tone: 'amber' as const,
      run: () => {
        sound.play('confirm')
        s().pushFeed('ok', 'system', `Siren self-test · ${SIRENS.length}/${SIRENS.length} coastal sirens reported healthy`)
        s().toast('ok', 'Sirens healthy', `${SIRENS.length} sirens · voice playback verified`)
      },
    },
    {
      label: 'Volunteer Roll-Call', icon: UsersRound, tone: 'cyan' as const,
      run: () => {
        sound.play('click')
        s().pushFeed('info', 'system', 'Roll-call sent to 1,412 Aapda Mitra volunteers · 1,142 available')
        s().toast('info', 'Roll-call sent', '1,142 volunteers available')
      },
    },
    {
      label: 'Sync Shelter Status', icon: ClipboardCheck, tone: 'cyan' as const,
      run: () => {
        sound.play('click')
        s().pushFeed('ok', 'system', 'Shelter sync · 879 shelters reporting · capacity 1,04,500')
        s().toast('ok', 'Shelters synced', '879 shelters verified')
      },
    },
    {
      label: 'Review Forecast', icon: Waves, tone: 'green' as const,
      run: () => {
        sound.play('click')
        s().pushFeed('info', 'alert', 'IMD outlook reviewed · no cyclogenesis expected in next 72h')
        s().toast('info', 'Forecast reviewed', 'No systems over the Bay of Bengal')
      },
    },
  ]

  const alertActions = [
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

  const actions = calm ? calmActions : alertActions

  return (
    <div className="glass brackets pointer-events-auto rounded-xl p-2">
      <span className="bk tl" />
      <span className="bk tr" />
      <span className="bk bl" />
      <span className="bk br" />
      <div className="mb-1.5 flex items-center gap-2 px-1">
        <ShieldAlert size={13} className={calm ? 'text-cyan-300' : 'text-rose-300'} />
        <span className={`label ${calm ? 'text-cyan-200' : 'text-rose-200'}`}>{calm ? 'Readiness Controls' : 'Early Threat Controls'}</span>
        <span className={`ml-auto h-1.5 w-1.5 rounded-full ${calm ? 'bg-green-400 pulse-dot' : 'bg-rose-400 blink'}`} />
      </div>
      {calm && (
        <button
          onClick={() => s().triggerEvent()}
          className="mb-1.5 flex w-full items-center justify-center gap-3 rounded-lg border border-amber-400/50 bg-amber-500/15 py-2.5 font-hud text-[13px] font-bold uppercase tracking-[0.2em] text-amber-100 shadow-[0_0_22px_rgba(245,158,11,0.2)] transition-colors hover:bg-amber-500/25 cursor-pointer"
        >
          <Zap size={16} /> Declare Incident
          <kbd className="rounded border border-amber-300/60 bg-amber-400/20 px-1.5 py-[1px] font-mono text-[11px]">E</kbd>
        </button>
      )}
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
