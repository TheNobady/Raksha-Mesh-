import { Cast, MessageSquareText, Network, PhoneCall, Radio, Satellite, Siren, Smartphone, Tv, Volume2, type LucideIcon } from 'lucide-react'
import type { ChannelId } from '../../data/content'

export const CHANNEL_ICON: Record<ChannelId, LucideIcon> = {
  data: Smartphone,
  cb: Cast,
  sms: MessageSquareText,
  ivr: PhoneCall,
  fm: Radio,
  tv: Tv,
  siren: Siren,
  speaker: Volume2,
  sat: Satellite,
  mesh: Network,
}
