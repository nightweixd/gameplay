export const games = [
  {
    id: 'minecraft',
    title: 'Minecraft',
    subtitle: 'Build a world. Code your agent.',
    description: 'Explore a block world, dream up a build, and bring it to life with code.',
    skills: ['Block coding', 'Creative building'],
    available: true,
    href: '/games/minecraft',
  },
  {
    id: 'next',
    title: 'The next adventure',
    subtitle: 'A new way to play is on its way.',
    description: 'More games will land here. For now, there’s a whole block world to explore.',
    skills: [],
    available: false,
    href: '',
  },
] as const
