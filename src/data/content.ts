export type ChannelId = 'data' | 'cb' | 'sms' | 'ivr' | 'fm' | 'tv' | 'siren' | 'speaker' | 'sat' | 'mesh'

export interface ChannelDef {
  id: ChannelId
  name: string
  short: string
  desc: string
  /** final delivered count */
  delivered: number
  unit: string
  reach: number
  latency: string
  /** display formatter hint */
  kind: 'people' | 'listeners' | 'units' | 'nodes'
  total?: number
}

export const CHANNELS: ChannelDef[] = [
  { id: 'data', name: 'Mobile Data', short: 'DATA', desc: 'Push notifications via internet to the Raksha Mesh app.', delivered: 0, unit: 'devices', reach: 0, latency: 'timeout', kind: 'people' },
  { id: 'cb', name: 'Cell Broadcast', short: 'CB', desc: 'Emergency broadcast to every handset on surviving towers.', delivered: 184200, unit: 'handsets', reach: 44, latency: '1.8 s', kind: 'people' },
  { id: 'sms', name: 'SMS', short: 'SMS', desc: 'Flash + standard SMS in local language to registered numbers.', delivered: 96400, unit: 'SMS', reach: 23, latency: '4.2 s', kind: 'people' },
  { id: 'ivr', name: 'Voice Call (IVR)', short: 'IVR', desc: 'Automated voice call in Odia with Press-1 acknowledgement.', delivered: 52300, unit: 'calls', reach: 12, latency: '9 s', kind: 'people' },
  { id: 'fm', name: 'FM Radio', short: 'FM', desc: 'Pre-empts programming on Akashvani & community radio.', delivered: 310000, unit: 'listeners', reach: 74, latency: '12 s', kind: 'listeners' },
  { id: 'tv', name: 'TV Broadcast', short: 'TV', desc: 'Scrolling ticker & full-screen crawl on regional channels.', delivered: 128000, unit: 'viewers', reach: 30, latency: '20 s', kind: 'listeners' },
  { id: 'siren', name: 'Sirens', short: 'SIREN', desc: 'Coastal smart sirens with voice playback.', delivered: 48, total: 48, unit: 'active', reach: 100, latency: '3 s', kind: 'units' },
  { id: 'speaker', name: 'Loudspeakers', short: 'PA', desc: 'Temples, mosques, gurudwaras, churches & public PA.', delivered: 64, total: 64, unit: 'hubs', reach: 96, latency: '6 s', kind: 'units' },
  { id: 'sat', name: 'Satellite', short: 'SAT', desc: 'VSAT relay to cut-off panchayats & shelters.', delivered: 212, unit: 'terminals', reach: 88, latency: '2.6 s', kind: 'units' },
  { id: 'mesh', name: 'Mesh', short: 'MESH', desc: 'Phone-to-phone Bluetooth/Wi-Fi + LoRa village relay.', delivered: 312, unit: 'nodes', reach: 81, latency: '27 hops', kind: 'nodes' },
]

export const CHANNEL_BY_ID = Object.fromEntries(CHANNELS.map((c) => [c.id, c])) as Record<ChannelId, ChannelDef>

// ---------------------------------------------------------------------------

export type LangId = 'or' | 'hi' | 'bn' | 'te' | 'en' | 'sambalpuri' | 'desia'

export const LANGUAGES: { id: LangId; name: string; native: string; voice: string; dialect?: boolean }[] = [
  { id: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', voice: 'or-IN' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी', voice: 'hi-IN' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা', voice: 'bn-IN' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు', voice: 'te-IN' },
  { id: 'en', name: 'English', native: 'English', voice: 'en-IN' },
  { id: 'sambalpuri', name: 'Sambalpuri', native: 'ସମ୍ବଲପୁରୀ', voice: 'or-IN', dialect: true },
  { id: 'desia', name: 'Desia', native: 'ଦେଶିଆ', voice: 'or-IN', dialect: true },
]

export const ALL_LANGUAGE_CHIPS = [
  'Odia', 'Hindi', 'Bengali', 'Telugu', 'English', 'Sambalpuri', 'Desia', 'Kui', 'Santali', 'Urdu', 'Tamil', 'Assamese',
]

export type HazardId = 'cyclone' | 'flood' | 'landslide' | 'tsunami' | 'heatwave' | 'lightning' | 'dam' | 'gas'
export const HAZARDS: { id: HazardId; name: string }[] = [
  { id: 'cyclone', name: 'Cyclone' },
  { id: 'flood', name: 'Flood' },
  { id: 'landslide', name: 'Landslide' },
  { id: 'tsunami', name: 'Tsunami' },
  { id: 'heatwave', name: 'Heatwave' },
  { id: 'lightning', name: 'Lightning' },
  { id: 'dam', name: 'Dam Release' },
  { id: 'gas', name: 'Gas Leak' },
]

export type Severity = 'watch' | 'warning' | 'evacuate'
export const SEVERITIES: { id: Severity; label: string; color: string; rgb: [number, number, number] }[] = [
  { id: 'watch', label: 'Watch', color: '#F59E0B', rgb: [245, 158, 11] },
  { id: 'warning', label: 'Warning', color: '#FB923C', rgb: [251, 146, 60] },
  { id: 'evacuate', label: 'Evacuate', color: '#F43F5E', rgb: [244, 63, 94] },
]

export const AUDIENCES = [
  'Everyone', 'Fishermen', 'Schools', 'Hospitals', 'Elderly', 'Pregnant women', 'Persons with disabilities', 'Tourists', 'Farmers',
]

export interface Template {
  id: string
  name: string
  hazard: HazardId
  text: Record<LangId, string>
}

export const TEMPLATES: Template[] = [
  {
    id: 'cyclone-evac',
    name: 'Cyclone – Evacuate to shelter',
    hazard: 'cyclone',
    text: {
      en: 'Severe cyclone will reach your village in about 6 hours. Tin roofs may fly off and water may enter homes. Go to the Government School shelter now. Take medicines, water, and documents.',
      hi: 'भीषण चक्रवात लगभग 6 घंटे में आपके गाँव पहुँचेगा। टीन की छतें उड़ सकती हैं और घरों में पानी घुस सकता है। अभी सरकारी स्कूल आश्रय स्थल जाएँ। दवाइयाँ, पानी और ज़रूरी कागज़ात साथ ले जाएँ।',
      or: 'ପ୍ରବଳ ବାତ୍ୟା ପ୍ରାୟ ୬ ଘଣ୍ଟା ମଧ୍ୟରେ ଆପଣଙ୍କ ଗାଁରେ ପହଞ୍ଚିବ। ଟିଣ ଛାତ ଉଡ଼ିଯାଇପାରେ ଏବଂ ଘର ଭିତରକୁ ପାଣି ପଶିପାରେ। ଏବେ ସରକାରୀ ବିଦ୍ୟାଳୟ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ଔଷଧ, ପାଣି ଓ ଦରକାରୀ କାଗଜପତ୍ର ସାଙ୍ଗରେ ନିଅନ୍ତୁ।',
      bn: 'প্রবল ঘূর্ণিঝড় প্রায় ৬ ঘণ্টার মধ্যে আপনার গ্রামে পৌঁছাবে। টিনের চাল উড়ে যেতে পারে এবং ঘরে জল ঢুকতে পারে। এখনই সরকারি স্কুলের আশ্রয়কেন্দ্রে যান। ওষুধ, জল এবং প্রয়োজনীয় কাগজপত্র সঙ্গে নিন।',
      te: 'తీవ్ర తుఫాను సుమారు 6 గంటల్లో మీ గ్రామానికి చేరుతుంది. రేకుల పైకప్పులు ఎగిరిపోవచ్చు, ఇళ్లలోకి నీరు రావచ్చు. వెంటనే ప్రభుత్వ పాఠశాల ఆశ్రయ కేంద్రానికి వెళ్ళండి. మందులు, నీరు, ముఖ్యమైన పత్రాలు తీసుకెళ్ళండి.',
      sambalpuri: 'ବଡ଼ ତୁଫାନ୍ ପାଖାପାଖି ୬ ଘଣ୍ଟାରେ ତମର ଗାଁଏ ଆସି ପହଁଚବା। ଟିଣ୍ ଛପର୍ ଉଡ଼ି ଯାଇପାରେ ଆର୍ ଘରେ ପାନି ପଶିପାରେ। ଏଭେ ସରକାରୀ ଇସ୍କୁଲ୍ ଆଶ୍ରୟକେ ଯାଅ। ଦବାଇ, ପାନି ଆର୍ କାଗଜ୍ ଧରିକରି ଯାଅ।',
      desia: 'ବଡ୍ ଝଡ୍ ଛଅ ଘଣ୍ଟାନେ ତୁମର୍ ଗାଁକେ ଆସୁଛେ। ଟିଣ୍ ଛାନି ଉଡିଯିବା, ଘରେ ପାଏନ୍ ପଶିବା। ଏବେ ସରକାରୀ ଇସ୍କୁଲ୍‌କେ ଯା। ଔସଦ୍, ପାଏନ୍, କାଗଜ୍ ନେଇକରି ଯା।',
    },
  },
  {
    id: 'fishermen',
    name: 'Fishermen – Return to shore',
    hazard: 'cyclone',
    text: {
      en: 'Do not go to sea. Fishermen at sea must return to the nearest shore immediately. The sea will be very rough with waves up to 4 metres.',
      hi: 'समुद्र में न जाएँ। समुद्र में मौजूद मछुआरे तुरंत नज़दीकी तट पर लौटें। समुद्र बहुत अशांत रहेगा और 4 मीटर तक ऊँची लहरें उठेंगी।',
      or: 'ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ସମୁଦ୍ରରେ ଥିବା ମତ୍ସ୍ୟଜୀବୀ ତୁରନ୍ତ ନିକଟତମ କୂଳକୁ ଫେରନ୍ତୁ। ସମୁଦ୍ର ଅତ୍ୟନ୍ତ ଉତ୍ତାଳ ରହିବ ଓ ୪ ମିଟର ପର୍ଯ୍ୟନ୍ତ ଉଚ୍ଚ ଢେଉ ଉଠିବ।',
      bn: 'সমুদ্রে যাবেন না। সমুদ্রে থাকা মৎস্যজীবীরা অবিলম্বে নিকটবর্তী তীরে ফিরে আসুন। সমুদ্র খুব উত্তাল থাকবে, ৪ মিটার পর্যন্ত উঁচু ঢেউ উঠবে।',
      te: 'సముద్రంలోకి వెళ్ళవద్దు. సముద్రంలో ఉన్న మత్స్యకారులు వెంటనే దగ్గరలోని తీరానికి తిరిగి రండి. సముద్రం చాలా అల్లకల్లోలంగా ఉంటుంది, 4 మీటర్ల ఎత్తు వరకు అలలు ఎగసిపడతాయి.',
      sambalpuri: 'ସମୁଦରକେ ନ ଯାଅ। ସମୁଦରେ ଥିବା ମାଛଧରାଳି ଏଭେ ପାଖ କୂଳକେ ଫେରିଆସ। ସମୁଦର୍ ଖୁବ୍ ଉତ୍ତାଳ୍ ରହେବା, ୪ ମିଟର୍ ଉଁଚା ଢେଉ ଉଠବା।',
      desia: 'ସମୁଦ୍ରକେ ନାଇ ଯା। ସମୁଦ୍ରେ ଥିବା ମାଛ୍ ଧରାଲୋକ୍ ଏବେ କୂଲ୍‌କେ ଫେରି ଆସା। ସମୁଦ୍ର ବହୁତ୍ ଉତାଲ୍ ରଇବା।',
    },
  },
  {
    id: 'flood-high',
    name: 'Flood – Move to higher ground',
    hazard: 'flood',
    text: {
      en: 'Flood water is rising in your area. Move to higher ground or the nearest shelter now. Do not walk or drive through flood water. Switch off electricity at home.',
      hi: 'आपके क्षेत्र में बाढ़ का पानी बढ़ रहा है। अभी ऊँचे स्थान या नज़दीकी आश्रय स्थल पर जाएँ। बाढ़ के पानी में पैदल या वाहन से न जाएँ। घर की बिजली बंद कर दें।',
      or: 'ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ବନ୍ୟା ପାଣି ବଢ଼ୁଛି। ଏବେ ଉଚ୍ଚ ସ୍ଥାନ କିମ୍ବା ନିକଟତମ ଆଶ୍ରୟସ୍ଥଳକୁ ଯାଆନ୍ତୁ। ବନ୍ୟା ପାଣି ଦେଇ ଚାଲନ୍ତୁ ନାହିଁ କି ଗାଡ଼ି ଚଲାନ୍ତୁ ନାହିଁ। ଘରର ବିଦ୍ୟୁତ୍ ବନ୍ଦ କରନ୍ତୁ।',
      bn: 'আপনার এলাকায় বন্যার জল বাড়ছে। এখনই উঁচু জায়গায় বা নিকটবর্তী আশ্রয়কেন্দ্রে যান। বন্যার জলের মধ্য দিয়ে হাঁটবেন না বা গাড়ি চালাবেন না। বাড়ির বিদ্যুৎ বন্ধ করুন।',
      te: 'మీ ప్రాంతంలో వరద నీరు పెరుగుతోంది. వెంటనే ఎత్తైన ప్రదేశానికి లేదా దగ్గరలోని ఆశ్రయ కేంద్రానికి వెళ్ళండి. వరద నీటిలో నడవవద్దు, వాహనం నడపవద్దు. ఇంట్లో విద్యుత్ ఆపివేయండి.',
      sambalpuri: 'ତମର୍ ଏଲାକାଏ ବଢ଼ି ପାନି ବଢୁଛେ। ଏଭେ ଉଁଚା ଜାଗା ନାଇଁ ପାଖ ଆଶ୍ରୟକେ ଯାଅ। ବଢ଼ି ପାନିରେ ନ ଚାଲ। ଘରର୍ କରେଣ୍ଟ ବନ୍ଦ କର।',
      desia: 'ତୁମର୍ ଗାଁନେ ବଢି ପାଏନ୍ ବଢୁଛେ। ଏବେ ଉଁଚ୍ ଜାଗାକେ ଯା। ପାଏନ୍ ଭିତ୍ରେ ନାଇ ଚାଲ୍। ଘରର୍ କରେଣ୍ଟ୍ ବନ୍ଦ୍ କର।',
    },
  },
]

export const IVR_TRANSCRIPT = [
  'ନମସ୍କାର। ଏହା ରକ୍ଷା ମେଶ୍ ସରକାରୀ ଜରୁରୀ ସୂଚନା।',
  'Namaskar. This is a Raksha Mesh government emergency alert.',
  'Severe cyclone VAYU-26 will reach Astaranga in about 6 hours.',
  'Go to Govt. High School shelter, 1.2 km away, now.',
  'Take medicines, drinking water and documents.',
  'Press 1 to confirm you heard this message.',
  'Press 2 for shelter directions. Press 3 if you need help.',
]

// ---------------------------------------------------------------------------

export const TICKER_ITEMS = [
  'IMD BULLETIN 14: VAYU-26 intensified into Extremely Severe Cyclonic Storm · 185 km/h sustained winds',
  'Storm surge of 2.5–3.0 m likely to inundate low-lying areas of Jagatsinghpur, Kendrapara & Puri',
  'Fishermen advised not to venture into sea till further notice · Port Paradip hoists Great Danger Signal X',
  'NDRF: 18 teams pre-positioned across 6 coastal districts',
  'Heavy to extremely heavy rainfall (>204.5 mm) at isolated places in Balasore, Bhadrak, Kendrapara',
  'Raksha Mesh: 1,248 nodes connected · failover paths verified · mesh relay armed',
  'Railways: 42 trains cancelled on Howrah–Chennai route · Bhubaneswar airport ops suspended from 18:00',
  'Power utility: pre-emptive shutdown planned for coastal feeders ahead of landfall',
  'Health dept: 312 pregnant women shifted to delivery-point hospitals in advance',
  'Mahanadi at Naraj: water level 25.8 m, rising · Hirakud releasing 3.1 lakh cusecs',
]

export const AMBIENT_EVENTS: { sev: 'info' | 'ok' | 'warn'; text: string }[] = [
  { sev: 'info', text: 'AWS Paradip: wind 96 km/h gusting 118 · pressure 981 hPa' },
  { sev: 'ok', text: 'Heartbeat OK · 312 LoRa mesh nodes responding' },
  { sev: 'info', text: 'Doppler radar Gopalpur: eye wall well defined, 38 km diameter' },
  { sev: 'ok', text: 'Siren self-test passed · Ersama cluster (8/8)' },
  { sev: 'info', text: 'INSAT-3DR imagery refreshed · T-number 5.0' },
  { sev: 'info', text: 'Tide gauge Dhamra: +1.4 m above astronomical tide' },
  { sev: 'ok', text: 'VSAT link Khordha ↔ NEOC latency 612 ms · stable' },
  { sev: 'warn', text: 'Rain gauge Kendrapara: 64 mm in last hour' },
  { sev: 'info', text: 'Shelter occupancy sync · 72 shelters reporting' },
  { sev: 'ok', text: 'Community radio Kujang re-broadcast confirmed' },
  { sev: 'info', text: 'Buoy BD-11: significant wave height 7.2 m' },
  { sev: 'warn', text: 'Grid feeder Astaranga-2 tripped · DG backup on' },
  { sev: 'ok', text: 'Aapda Mitra roll-call: 1,142 volunteers on duty' },
  { sev: 'info', text: 'Mesh routing table recomputed · 27 hops max path' },
]
