# Raksha Mesh — Demo Runbook

How to show this project so every feature lands. Read the **Before you start** checklist, then follow
the **Five-minute script**. Everything else is backup: a short version, a feature checklist, and what
to do if something goes sideways.

The story you are telling, in one line:

> A cyclone is closing in, the mobile network dies, an official draws a danger zone, the alert goes
> out over nine other channels in seven languages, villages confirm one by one — and the handful that
> stay silent get a volunteer, a drone and a boat.

---

## Before you start (2 minutes)

1. `npm run dev`, open **http://localhost:5173** in Chrome.
2. **Full screen the browser** (`F11`). Zoom must be 100% (`Ctrl+0`).
3. **Sound on.** Unmute the laptop and check the speaker icon in the top bar isn't crossed out. Audio only unlocks after you click *Initialise Command Centre*, so click it once while setting up, then press `R` to reset.
4. **Check the network.** The basemap and terrain tiles come from the internet. On venue wifi, load the page once before you present so tiles are cached. If tiles can't load, the app falls back to its own dark map and still works — don't panic.
5. **Check smoothness.** Press `Ctrl+Shift+P` for the presenter panel and look at the fps readout (bottom right of the Graphics row). If it sits below ~40, click **perf**. To lock it in from the start, open `http://localhost:5173/?q=perf`.
6. **Do a dry run.** Press `E` (declare the event), then `B` (skip to broadcast), watch the failover, then `R` to reset back to calm. Total 30 seconds, and it warms up shaders so the real run is smooth.
7. Close other apps, especially anything using the GPU (video calls, another Chrome window with video).

**Leave the app on the start screen** (`R` returns to it if needed, then reload if you want the boot sequence again). The first thing the judges should see is the animated logo and the boot log.

---

## The five-minute script

Timings are the scenario clock at 1× speed. You control the pace — the story **pauses and waits** at
the broadcast gate, so you can talk as long as you like before you send the alert.

### 0:00 — Open on a quiet day

**Do:** Click **INITIALISE COMMAND CENTRE**. Then stop and talk.

**Happens:** Boot lines finish and the map flies from all of India down to a **standby view** of the
Odisha coast. The full dashboard is there — but on an ordinary day: 99.2% uptime, 1,320 nodes online,
10/10 channels ready, 879 shelters ready, **0 active alerts**, every district *Normal*, IMD reading
"No Active System", routine chatter in the feed. The map shows the national backbone only: no storm,
no risk tint on Odisha.

**Say:** "This is the system on an ordinary day. It's monitoring 1,320 nodes across the coast and
nothing is happening — which is what a control room looks like 99% of the time."

**Optional (strong):** scroll-zoom into the coast. Towers, shelters, sirens, loudspeakers and village
mesh nodes fade in as you close in. "The detail is there when you go looking for it."

> This pause is doing work. The quieter the opening, the bigger the next beat lands.

### 0:20 — Declare the event

**Do:** Press **`E`** (or click **DECLARE INCIDENT** in the readiness controls).

**Happens:** A siren and an amber flash, "CYCLONE VAYU-26 · EVENT DETECTED". Every panel flips to its
alert state and cascades back in — uptime and readiness become *people in danger*, *districts on
alert*, *active alerts*; the IMD panel becomes Cyclone VAYU-26 with a landfall countdown; hazards go
red; districts go Extreme. Odisha lights up with the full sensor network and risk tint, the camera
closes on the coast, and the cyclone spins up in the Bay.

**Say:** "IMD issues a bulletin. Watch the same dashboard turn into a crisis room."

> Say nothing for two seconds while it re-assembles. Let them watch it.

### 0:25–0:55 — The situation builds itself

**Do:** Nothing. Just narrate while the scripted events fire.

**Happens, in order (timings are from the moment you pressed `E`):** IMD bulletin toast (+5 s) →
forecast cone appears (+11 s) → **12 towers go red** near Ersama and Kujang (+18 s) → flood spreads
across the Mahanadi delta and a landslide blocks a ghat road (+24 s) → **34 towers down**, the top bar
switches to a tower-outage warning (+30 s).

**Say:** "Nobody has touched anything yet. The storm is tracking, the forecast cone is published, and
the network is already losing towers — this is exactly when a warning has to go out, and exactly when
mobile data stops being reliable."

**Point at:** the KPI strip counting up (people in the danger zone, districts on alert, channels
online dropping to 9/10) and the live event feed on the right.

### 0:56 — The gate: it waits for you

36 seconds after the event was declared the clock **stops** and the presenter panel shows *"Awaiting official: draw zone & broadcast"*.
Take as long as you want here.

**Do (optional, strong):** Hover a red tower on the map — a tooltip shows its status, uptime and last
ping. Click it for a detail card.

**Say:** "From here the system does nothing on its own. An official has to decide who is in danger."

### 1:00 — Draw the danger zone (the one thing that's genuinely real)

**Do:**
1. Click **ALERT COMPOSER** in the sidebar (or the **Draw Danger Zone** button in Early Threat Controls).
2. Click **Polygon**, then click 5–6 points on the map around the coast, and click your first point to close it.
3. Now **drag one vertex** outward.

**Happens:** The moment the polygon closes, the Live Impact strip fills in — population, villages,
schools, hospitals, shelters and capacity, mobile towers (and how many are down), sirens and PA hubs,
volunteers, vulnerable people, livestock, and the area in km². Dragging the vertex **recomputes
everything instantly** and the top-villages list reorders.

**Say:** "This is the one piece that isn't scripted. It's a real point-in-polygon computation over
450+ villages and every piece of infrastructure — drag a corner and the impact recalculates live.
That's what an officer actually needs: not 'a cyclone is coming', but *who* is inside the line."

> If you're short on time or nervous about drawing: click **Suggest from forecast** and it places a
> zone along the IMD cone in one click. Then drag a vertex to prove it's live.

### 1:20 — Compose the alert

**Do:** Walk down the right-hand panel, clicking as you go:
1. **Hazard** — leave Cyclone (show that Flood, Landslide, Tsunami, Heatwave, Gas Leak etc. exist).
2. **Severity** — click **EVACUATE**. The polygon on the map turns red with it.
3. **Audience** — click **Fishermen** and **Pregnant women** chips.
4. **Message** — the impact-based text is written in plain language ("Tin roofs may fly off… take medicines, water and documents"), not bureaucratic.
5. **Language tabs** — click **ଓଡ଼ିଆ**, **हिन्दी**, **বাংলা**, then **ସମ୍ବଲପୁରୀ** (marked *dialect*).
6. Click **▶ PLAY VOICE** — the waveform animates and it speaks.
7. Scroll to the **pictogram** row and the **sign-language avatar**.

**Say:** "Same alert, twelve languages and dialects, plus a voice version for people who can't read,
pictograms, and sign language. It's digitally signed and shows a verified government sender, because
in a disaster people get fake forwards."

### 2:10 — Two-person approval and broadcast

**Do:**
1. Click **SEND FOR APPROVAL**. Wait ~2 s for the Additional District Magistrate to approve (animated tick, name, timestamp, signature hash).
2. Click **CONTINUE TO BROADCAST**.
3. **Press and hold** the big red button for about a second until the ring completes.

**Happens:** The screen flashes, a siren plays, and the app jumps to **Routing & Channels** by itself.
The three phones slide in from the right.

**Say:** "Two officials have to sign off — that's the real protocol — and the broadcast itself is
press-and-hold, so nobody evacuates six lakh people by misclicking."

### 2:20–2:35 — The failover (the money shot)

**Do:** Stand back and let it play. Point, don't click.

**Happens:** Mobile Data turns amber and "attempts" with the latency climbing → it **flips to a big
red FAILED card** with an error buzz, *Cell latency: timeout · Delivered: 0%* → the **Intelligent
Failover Active** banner slides in → **glowing green routes fan out** from the dead card to all nine
other channels → they light up green one at a time with a chime, each with a delivery counter ticking
up.

**Say:** "Mobile data is gone — the towers that carry it are underwater. The system doesn't retry and
give up. It reroutes: cell broadcast to every handset still in range, SMS, automated voice calls,
FM, TV, 48 coastal sirens, 64 loudspeakers at temples and mosques, satellite terminals, and
phone-to-phone mesh."

**Then point at the bottom panels:** delivery target filling toward 93%, per-channel reach bars, and
the **Mesh Relay village view** on the right — towers marked NO SIGNAL, phones connecting outward
hop by hop, and a bus physically carrying the message down a road to a cut-off village.

### 2:40 — The phones (pick these up and click them)

Three phones are now on screen. They're live UI, not pictures.

**Do, in this order:**
1. **Citizen smartphone** — it already took over with a red EXTREME ALERT in Odia. Click **English** to toggle the language, then **Open Raksha Mesh** → tap the big green **I'M SAFE** → *"Sent to 4 family members via Mesh"*.
   **Watch the map:** that village turns green.
2. **Keypad phone** — it's ringing ("RAKSHA ALERT · +91 1078"). Click the **green call key**. The IVR speaks in Odia and the transcript scrolls. Then press **1**.
   **Say:** "Press 1 to confirm. That's the acknowledgement channel for a ₹1,200 phone with no internet." The village turns green on the map and the feed logs the IVR acknowledgement.
3. Leave the **volunteer phone** for now — it fires in a moment.

> The phones can be dragged, minimised, and toggled with `P`. The three small phone icons in the top
> bar (APP / IVR / VOL) bring them back.

### 3:00–3:20 — Who actually got the message

**Do:** Click **REACH & ACK** in the sidebar.

**Happens:** Villages turn green in waves across the map. The delivery funnel animates
Sent → Delivered → Heard → Acknowledged → Evacuated. Then three villages stay **red and pulsing**:
Kantiapada, Balijhari, Nuagaon.

**Say:** "Every other dashboard stops at 'alert sent'. The number that matters is who *confirmed*.
96% delivered, 85% heard, and then these three villages — 886 households — never responded on any
channel."

**Point at:** acknowledgement by channel (app taps vs IVR Press-1 vs missed calls vs door-to-door) —
"most confirmations came from the voice call, not the app."

### 3:20 — Send a human

**Do:** In the **Unreached villages** list, click **DISPATCH VOLUNTEER** next to Kantiapada.

**Happens:** The volunteer phone (Aapda Mitra) buzzes with an urgent task: *"Kantiapada has not
responded. 12 households. 2 elderly, 1 pregnant woman."*

**Do:** On the phone, click **ACCEPT TASK** → tick 4 or 5 households in the checklist.

**Watch:** Kantiapada goes red → amber on the map as houses get ticked. Tick them all (or click
**TASK COMPLETE · I'M SAFE**) and it turns green with a confetti burst, and the unreached count drops.

**Say:** "When the technology runs out, it routes to a person, and that person's work shows up on the
same map."

### 3:50 — Rescue

**Do:** Click **RESCUE OPS**.

**Happens:** SOS requests have been arriving and are ranked by urgency — a pregnant woman with water
rising, an elderly roof collapse merged from three duplicate calls, livestock stranded. Each row shows
where it came from (app, IVR, missed call, drone, or "no response to alert").

**Do:**
1. On the **drone feed**, click **THERMAL**. Three human-shaped heat signatures appear on a rooftop with targeting boxes, confidence percentages and a blinking *PERSON DETECTED — 3*.
2. Click **MARK FOR RESCUE** — it jumps to the top of the SOS board.
3. Click **DISPATCH BOAT** on the top row.

**Happens:** A boat leaves the NDRF base at Kujang and moves along a route on the map with a live ETA
(about 14 s). When it arrives: the village flips to green, a *Rescued: N people* toast appears, the
rescued counter increments, and the row gets a green **RESCUED** stamp.

**Say:** "Thermal, because in a flood at night you cannot see people on a roof. The board is ranked by
urgency, not by who shouted loudest, and duplicate calls from the same village get merged so teams
aren't sent twice."

### 4:30 — Close

**Do:** Click **COMMAND CENTRE** for the wide shot.

**Say:** "From cyclone to confirmed rescue: the warning got out when the network was down, in the
languages people actually speak, to smartphones, keypad phones and people with no phone at all — and
we can prove who was reached and who wasn't."

---

## The 90-second version (if judges are rushed)

1. Click **Initialise**, let the fly-in land on the standby dashboard. *(10 s)*
2. Press **`E`** — the command centre assembles. *(3 s)*
3. Press **`B`** — skips straight past the setup and broadcasts with a suggested zone. *(instant)*
3. Let the **failover** play and narrate it. *(20 s)*
4. On the keypad phone: click the green key, press **1**. *(15 s)*
5. Sidebar → **REACH & ACK**: waves of green, three red villages. *(20 s)*
6. Sidebar → **RESCUE OPS**: click **THERMAL**, then **DISPATCH BOAT**. *(25 s)*

---

## Feature checklist

Tick these off if you have time or get asked "what else does it do?"

**Command Centre**
- [ ] Hover any node → tooltip (type, status, uptime, last ping); click → detail card
- [ ] District risk table — click a row to fly there
- [ ] Map controls: zoom, reset view, **2D/3D** (turns on 3D terrain), layer panel
- [ ] Layer panel — toggle flood, landslide, rainfall heat, heatwave, lightning, storm surge, packets; also the **graphics level**
- [ ] Standby readiness controls: **Run Channel Test**, **Siren Self-Test**, **Volunteer Roll-Call**, **Sync Shelter Status**, **Review Forecast** (each writes to the feed)
- [ ] Zoom in and out on the map to show network level of detail
- [ ] Early Threat Controls: **Trigger Sirens** (siren sound + rings rippling out across the coast), **Deploy Drones**, **Request NDRF Support**, **Activate All Channels**
- [ ] The maximise button hides all panels for a clean full-map shot

**Composer**
- [ ] **Radius** tool as an alternative to polygon
- [ ] **Edit** mode — drag vertices *and* midpoints, delete points
- [ ] Severity changes the polygon colour live
- [ ] Staged alert toggle (72 h heads-up → 24 h warning → evacuation)
- [ ] Template dropdown (fishermen return to shore, flood move to higher ground)

**Routing**
- [ ] The compact channel status list on the right (needs a ≥1600 px wide window)
- [ ] **View details** on any channel card
- [ ] Tower health thumbnail showing exactly which towers are down

**Phones**
- [ ] Smartphone: **Shelter** tab (route, distance, spaces left) and **Mesh** tab (Bluetooth relay toggle → "relaying to 23 nearby phones")
- [ ] Smartphone **SOS** button → appears on the rescue board
- [ ] Keypad: press **2** for shelter directions, **3** to request help (creates an IVR SOS)
- [ ] Phones drag, minimise, and toggle with `P`

**Other screens**
- [ ] Event feed filters (All / Critical / Channels / Rescue); hovering pauses the scroll
- [ ] Shelters / Volunteers / Recovery / Reports / Settings — honest "Phase 2" placeholders with mock content

---

## Presenter panel & keyboard

`Ctrl + Shift + P` (or backtick) opens it. It's deliberately plain-looking so it reads as a control
surface, not part of the product. Drag it out of the way.

| Key | Does |
| --- | --- |
| `E` | Declare the cyclone event (everything animates in) |
| `Shift + E` | Stand down to the calm monitoring screen |
| `Space` | Play / pause the scenario |
| `→` | Next step |
| `←` | Previous step (panel open) |
| `B` | Skip straight to broadcast |
| `R` | Reset everything |
| `P` | Show / hide the phones |

In the panel: current step name and number (of 33), **jump to any step**, speed **0.5× / 1× / 2×**,
graphics level, mute, and an **auto-nav** toggle that follows the story across screens for you.

**Speed 2×** is useful if a judge asks "what happens next?" and you want to fast-forward the
acknowledgement waves.

---

## If something goes wrong

| Problem | Fix |
| --- | --- |
| It feels laggy | `Ctrl+Shift+P` → Graphics → **perf**. Or reload with `?q=perf`. |
| Map is blank / no basemap | The dark fallback map is fine — all data layers still render. Say "we're offline, this is the offline style" and carry on. |
| You drew a bad polygon | Click **Suggest from forecast**, or the bin icon, and draw again. Nothing is locked. |
| The story got ahead of you | `Space` to pause. Presenter → **jump to step** to go back to any moment. |
| Phones in the way | `P` to hide, or drag them. The top-bar APP/IVR/VOL icons bring them back. |
| Total mess, judge is watching | `R`. Resets to the calm standby screen in under a second, deterministically — then press `E` to run it again. |
| Want to show the reveal twice | `Shift+E` back to calm, then `E` again. |
| No sound | Click anywhere first (browsers block audio until you interact), check the speaker icon in the top bar. Voice uses the browser's speech engine — if the laptop has no Odia voice it falls back to Hindi. |

**The golden rule:** the scenario fills in anything you don't do. If you skip the keypad phone, the
script acknowledges that village for you. You can't get stuck.

---

## Questions you will get, and honest answers

**"Is this real data?"**
No. Every village, tower, shelter and the cyclone itself are generated mock data for the demo — the
cyclone is deliberately fictional (VAYU-26). The one real computation is the danger-zone polygon: it
genuinely runs point-in-polygon over the dataset. We built it this way so the interface and the
decision flow could be designed properly first.

**"Does the mesh actually work?"**
Not in this prototype — the phone-to-phone relay is a visualisation of the approach. It's the part
that would need the most engineering, and it's based on existing Bluetooth/Wi-Fi Direct mesh and
LoRa work.

**"What's the hardest part to build for real?"**
Cell broadcast access needs a telecom operator and government authorisation, the mesh needs an app
installed before the disaster, and acknowledgement tracking raises privacy questions. The alerting,
routing and reach-tracking layers are conventional software.

**"Why does acknowledgement matter?"**
Because "alert sent" is not "person safe". Every screen here is built around the gap between those
two, which is where people actually die.

**"What's the map?"**
MapLibre with a Carto dark basemap, deck.gl for the animated layers, Terra Draw for the polygon and
Turf for the geometry. The India outline is our own and follows the official boundaries.

---

## Room setup notes

- **Project at 1920×1080 if you can.** The layout is built for it and adapts down to 1440×900. Below ~1600 px wide, a few side panels hide themselves.
- **Stand to the left of the screen.** The story moves left-to-right: map → composer → channels → phones.
- **Don't read the event feed aloud.** It's set dressing that makes the room feel alive; point at it once and move on.
- **The four moments that win it:** the standby dashboard flipping into a crisis room when you press `E`, the impact numbers changing as you drag a vertex, the red FAILED card fanning out into nine green channels, and the keypad phone ringing. If you only have time for four things, do those.
