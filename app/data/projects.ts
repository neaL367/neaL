export type Project = {
  name: string
  description: string
  link?: string
  video?: string
  image?: string
  id: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Orbit',
    description:
      'Discover and explore anime with detailed information and recommendations',
    link: 'https://orbit-eight-rosy.vercel.app/',
    video: "https://res.cloudinary.com/dzko1ftap/video/upload/v1744889969/or-video_ncfpai.mp4",
    id: 'project-1',
  },
  {
    name: 'Tesla Clone',
    description:
      'A clone of the Tesla website, built with React and TypeScript.',
    link: 'https://tesla-clone-black-sigma.vercel.app/',
    video: "https://res.cloudinary.com/dzko1ftap/video/upload/v1744889935/ts-video_sempyg.mp4",
    id: 'project-2',
  },
]