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
  coverImage?: string
}

type WorkExperience = {
  id: string
  logo: string
  company: string
  title: string
  start: string
  end: string
  link: string
  accomplishments?: string[]
}

type SocialLink = {
  label: string
  link: string
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

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    id: "work-1",
    logo: "/work/gg_logo.png",
    company: "GoodGeekClub",
    title: "Front-end developer and Volunteer",
    start: "2022",
    end: "Present",
    link: "https://goodgeek.club",
    accomplishments: [
      'Built WordPress sites for <a href="https://qlhealthcare.co.th" target="_blank" rel="noopener noreferrer">QL Healthcare Thailand</a>, <a href="https://dseelin.co.th" target="_blank" rel="noopener noreferrer">D.Seelin</a> & multilingual Next.js site for <a href="https://youthplusthailand.org" target="_blank" rel="noopener noreferrer">YouthPlusThailand</a> (all hosted on Plesk)',
      'Co‑created <a href="https://hopeis.us/" target="_blank" rel="noopener noreferrer">HopeIs.Us</a> - youth volunteer project promoting mindfulness through interactive quizzes, built in 2 months',
      'Managed AWS infra: Amazon Linux 2 EC2 (LAMP) & S3 static hosting with redirection rules'
    ]
  },
]

export const POSTS: Post[] = [
  {
    title: 'My Stack',
    description: 'An overview of my preferred tech tools, projects, and community contributions',
    link: '/post/stack',
    uid: 'post-1',
    coverImage: 'https://res.cloudinary.com/dzko1ftap/image/upload/v1745028503/cover_vgf7rw.png'
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
