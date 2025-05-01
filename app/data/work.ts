export type WorkExperience = {
  company: string;
  companyLogo: string;
  positions: WorkPosition[];
  current?: boolean;
  link?: string;
};

export type WorkPosition = {
  id: string;
  title: string;
  year: string;
  employmentType?: string;
  description?: string;
  icon?: 'developer' | 'volunteer';
  accomplishments?: string[];
  expanded?: boolean;
};

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: "GoodGeekClub",
    companyLogo: "/work/gg_logo.png",
    current: true,
    link: "https://goodgeek.club",
    positions: [
      {
        id: "work-ggc-1",
        title: "Web developer",
        year: "2022 - Present",
        employmentType: "Part-time",
        icon: "developer",
        accomplishments: [
          'Built WordPress sites for <a href="https://qlhealthcare.co.th" target="_blank" rel="noopener noreferrer">QL Healthcare Thailand</a>, <a href="https://dseelin.co.th" target="_blank" rel="noopener noreferrer">D.Seelin</a> & multilingual Next.js site for <a href="https://youthplusthailand.org" target="_blank" rel="noopener noreferrer">YouthPlusThailand</a> (all hosted on Plesk)',
          'Managed AWS infra: Amazon Linux 2 EC2 (LAMP) & S3 static hosting with redirection rules'
        ],
        expanded: true
      },
      {
        id: "work-ggc-2",
        title: "Volunteer",
        year: "2022 - Present",
        employmentType: "Part-time",
        icon: "volunteer",
        accomplishments: [
          'Co‑created <a href="https://hopeis.us/" target="_blank" rel="noopener noreferrer">HopeIs.Us</a> - youth volunteer project promoting mindfulness through interactive quizzes, built in 2 months',
          'Organized and led web development workshops for community members'
        ],
        expanded: false
      }
    ]
  }
]