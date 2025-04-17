type Project = {
  name: string
  description: string
  link?: string
  video?: string
  image?: string
  id: string
}

type Post = {
  title: string
  description: string
  link: string
  uid: string
}

type SocialLink = {
  label: string
  link: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Rockstar Games Clone',
    description:
      'A clone of the Rockstar Games website, built with React and TypeScript.',
    link: 'https://rockstar-clone-one.vercel.app/',
    image: '/projects/rg-clone/cover.png',
    id: 'project1',
  },
  {
    name: 'Tesla Clone',
    description:
      'A clone of the Tesla website, built with React and TypeScript.',
    link: 'https://tesla-clone-black-sigma.vercel.app/',
    video: "https://res.cloudinary.com/dzko1ftap/video/upload/v1744870325/vype1irqnhojmaimbxer.mp4",
    id: 'project2',
  },
]

export const POSTS: Post[] = [
  {
    title: 'My Stack',
    description: 'An overview of my preferred tech tools, projects, and community contributions',
    link: '/post/stack',
    uid: 'post-1',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Github',
    link: 'https://github.com/neaL367',
  },
  {
    label: 'Twitter',
    link: 'https://twitter.com/NL367',
  },
  // {
  //   label: 'LinkedIn',
  //   link: 'https://www.linkedin.com/in/',
  // },
  // {
  //   label: 'Instagram',
  //   link: 'https://www.instagram.com/',
  // },
]

export const EMAIL = 'atichatbusiness@gmail.com'
