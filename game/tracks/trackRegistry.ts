export interface TrackConfig {
  id: 'desert' | 'neon' | 'mountain'
  name: string
  subtitle: string
  laps: number
  difficulty: 1 | 2 | 3
  description: string
  stats: {
    length: string
    turns: number
    topSpeed: string
  }
  accentColor: string
  bgColor: string
}

export const TRACKS: TrackConfig[] = [
  {
    id: 'desert',
    name: 'Desert Run',
    subtitle: 'Sahara Circuit',
    laps: 3,
    difficulty: 1,
    description: 'Wide open straights and sweeping turns across a baking desert plateau. Perfect for high-speed racing.',
    stats: { length: '2.4 km', turns: 8, topSpeed: '220 km/h' },
    accentColor: '#ffd60a',
    bgColor: '#2a1a00',
  },
  {
    id: 'neon',
    name: 'Neon City',
    subtitle: 'Urban Night Circuit',
    laps: 4,
    difficulty: 2,
    description: 'Tight street circuit through a glowing metropolis. Unforgiving barriers and technical chicanes demand precision.',
    stats: { length: '1.8 km', turns: 14, topSpeed: '160 km/h' },
    accentColor: '#bf5fff',
    bgColor: '#0a001a',
  },
  {
    id: 'mountain',
    name: 'Mountain Circuit',
    subtitle: 'Alpine Pass',
    laps: 3,
    difficulty: 3,
    description: 'Dramatic elevation changes and blind hairpin switchbacks on a treacherous mountain pass. Not for the faint-hearted.',
    stats: { length: '3.1 km', turns: 11, topSpeed: '200 km/h' },
    accentColor: '#00c8ff',
    bgColor: '#001a2a',
  },
]