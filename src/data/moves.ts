import { DanceMove } from '../types';

export const DANCE_MOVES: DanceMove[] = [
  {
    id: 'dab',
    name: 'DAB',
    tagline: 'Extend arm high & tuck wrist',
    description: 'Extend one arm straight up diagonally, tuck your opposite wrist to your forehead or nose, and drop your head into the elbow crook.',
    difficulty: 'Easy',
    estimatedHoldTimeSec: 1.3,
    instructions: [
      'Extend one arm up diagonally.',
      'Touch your other hand to your nose.',
      'Tuck your face into that elbow crook.'
    ],
    keypointsFocus: ['Wrists', 'Shoulders', 'Nose / Head Tilt'],
    bgGradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
    accentColor: '#6366f1',
    svgIcon: 'dab',
    illustrationSrc: '/dab.png'
  },
  {
    id: 'whip',
    name: 'WHIP',
    tagline: 'Forward punch & drop',
    description: 'Drive one arm straight forward at shoulder height like steering a lowrider, bend the opposite arm back, and drop into a subtle power stance.',
    difficulty: 'Medium',
    estimatedHoldTimeSec: 1.3,
    instructions: [
      'Punch one arm forward at shoulder level',
      'Leave the other arm down by your side',
      'Squat slightly'
    ],
    keypointsFocus: ['Extended Arm', 'Pulled Elbow', 'Hip Level'],
    bgGradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    accentColor: '#10b981',
    svgIcon: 'whip',
    illustrationSrc: '/whip.png'
  },
  {
    id: 'woah',
    name: 'WHOA',
    tagline: 'Freeze at chest height',
    description: 'Bring both hands together in front of your chest with wrists raised and elbows flared wide outward. Freeze in mid-air stillness.',
    difficulty: 'Iconic',
    estimatedHoldTimeSec: 1.3,
    instructions: [
      'Bring one fist to the opposite shoulder',
      'Bring the other to the opposite hip bone'
    ],
    keypointsFocus: ['Both Wrists at Chest', 'Flared Elbows', 'Stillness'],
    bgGradient: 'from-purple-600/20 via-fuchsia-600/10 to-transparent',
    accentColor: '#d946ef',
    svgIcon: 'woah',
    illustrationSrc: '/whoa.png'
  }
];
