export type Post = {
  title: string
  description: string
  link: string
  uid: string
  coverImage?: string
}

export const POSTS: Post[] = [
  {
    title: 'My Stack',
    description: 'An overview of my preferred tech tools, projects, and community contributions',
    link: '/post/stack',
    uid: 'post-1',
    coverImage: 'https://res.cloudinary.com/dzko1ftap/image/upload/v1745028503/cover_vgf7rw.png'
  },
]