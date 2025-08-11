export interface Project {
  title: string;
  year: number;
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    title: "Orbit",
    year: 2024,
    description: "Explore anime with detailed information and recommendations",
    url: "https://orbit-eight-rosy.vercel.app/",
  },
  {
    title: "Tesla Clone",
    year: 2023,
    description: "A clone of the Tesla website, built with React and TypeScript",
    url: "https://tesla-clone-black-sigma.vercel.app/",
  },
];
