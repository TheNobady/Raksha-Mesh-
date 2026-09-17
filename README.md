# Raksha Mesh — Disaster Command Centre (prototype)

A frontend-only, demo-grade command centre for an offline-first, multi-channel disaster early-warning network.
The scenario is a fictional severe cyclone (**VAYU-26**) approaching the Odisha coast. All data is mock data, and a deterministic scripted scenario drives it.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
```

## Demo controls

| Key | Action |
| --- | --- |
| `Ctrl + Shift + P` or `` ` `` | Toggle the hidden **presenter panel** |
| `Space` | Play / pause the scenario |
| `→` | Next step (at the broadcast gate this auto-broadcasts with the suggested zone) |
| `←` | Previous step (while the presenter panel is open) |
| `B` | Skip straight to broadcast |
| `R` | Reset everything |
| `P` | Show / hide the three phones |

The presenter panel also has **Jump to step** (a deterministic replay), speed (0.5× / 1× / 2×), mute, and an
auto-navigate toggle that follows the story across screens.

Keypad phone: hover the phone, then use the keyboard. `Enter` answers, `1` / `2` / `3` are the IVR options, `Esc` hangs up.

## Story beats

1. Click **Initialise Command Centre**. This unlocks audio, then the map flies from India to the Odisha coast.
2. The cyclone intensifies, the forecast cone appears, coastal towers fail, and the flood extent grows.
3. **Alert Composer:** draw a polygon, or use *Suggest from forecast*. Drag vertices and watch the real turf.js impact update. Pick severity, audience, language and voice, then *Send for approval*, then press and hold **BROADCAST**.
4. **Routing & Channels:** Mobile Data fails, intelligent failover kicks in, and green routes light up every other channel. The mesh relay reaches a cut-off village.
5. The phones react: a smartphone emergency takeover, a keypad IVR call (press `1`), and a volunteer task.
6. **Reach & Ack:** villages turn green in waves, a few stay red, and *Dispatch Volunteer* sends someone to Kantiapada.
7. **Rescue Ops:** SOS requests are ranked, the drone thermal feed finds 3 people on a rooftop (*Mark for rescue*), boats get dispatched, and a RESCUED stamp appears.

Anything you do manually (drawing a zone, keypad `1`, ticking the checklist, dispatching boats) takes priority. The timeline fills in whatever you skip.

## Audio

Sounds are synthesised with the Web Audio API. To use recorded clips instead, drop files into `public/audio/`:

`siren.mp3`, `ringtone.mp3`, `error.mp3`, `chime.mp3`, `vibrate.mp3`, `alert-or-IN.mp3`, `alert-hi-IN.mp3`, …

Voice previews fall back to the browser's SpeechSynthesis. Odia voices are rarely installed, so Hindi is used when needed.

## Offline / venue notes

- Fonts and all mock data are bundled locally.
- The basemap (Carto Dark Matter) and terrain tiles need a network connection. If the style can't load within 6 s, the app switches to its own dark style: India outline, network, cyclone and effects all still render.
- 3D terrain is the most GPU-hungry layer. On a weak laptop, turn it off from the map's 2D/3D button or the layer panel.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · MapLibre GL 5 · deck.gl 9 (MapboxOverlay) · Terra Draw · Turf · Zustand ·
Framer Motion · Recharts · lucide-react · Howler.

Key files:

- `src/store/timeline.ts`: the declarative scenario
- `src/store/engine.ts`: clock, gate, jump/replay
- `src/store/scenarioStore.ts`: all state and actions
- `src/components/map/deckLayers.ts`: every animated map layer
- `src/lib/impact.ts`: the real point-in-polygon impact computation
- `src/components/composer/useTerraDraw.ts`: polygon drawing

All names, people and the cyclone are fictional. India's outline follows the official boundaries.
