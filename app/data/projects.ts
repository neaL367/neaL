export type Project = {
  name: string
  description: string
  link?: string
  image?: string
  id: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Orbit',
    description:
      'Discover and explore anime with detailed information and recommendations',
    link: 'https://orbit-eight-rosy.vercel.app/',
    id: 'project-1',
  },
  {
    name: 'Tesla Clone',
    description:
      'A clone of the Tesla website, built with React and TypeScript.',
    link: 'https://tesla-clone-black-sigma.vercel.app/',
    id: 'project-2',
  },
]