export const games = [
  {
    id: 'scratch',
    title: 'Scratch',
    subtitle: 'Imagine it. Snap it together.',
    description:
      'Create stories, games, and animations with colourful blocks on the Scratch website.',
    skills: ['Block coding', 'Stories & games'],
    available: true,
    href: 'https://scratch.mit.edu/',
  },
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
    id: 'python',
    title: 'Python Carnival',
    subtitle: 'Real Python. Playful little missions.',
    description: 'Open a cinema, stock a fruit stall, and light a carnival with real Python code.',
    skills: ['Python', '8 course-based missions'],
    available: true,
    href: '/games/python',
  },
  {
    id: 'next',
    title: 'The next adventure',
    subtitle: 'A new way to play is on its way.',
    description:
      'More games will land here. For now, pick an adventure and see what you can create.',
    skills: [],
    available: false,
    href: '',
  },
] as const
