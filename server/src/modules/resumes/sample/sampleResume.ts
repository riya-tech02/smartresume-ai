import type { Section, PersonalInfo } from '@smartresume/shared';

export const SAMPLE_PERSONAL_INFO: PersonalInfo = {
  fullName: 'Aarav Mehta',
  headline: 'Aspiring Full-Stack Software Engineer',
  email: 'aarav.mehta@example.com',
  phone: '+91 98765 43210',
  location: 'Bangalore, India',
  links: [
    { id: 'link_github', label: 'GitHub', url: 'https://github.com/example/aaravmehta' },
    { id: 'link_linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/example-aarav' },
  ],
};

export const SAMPLE_SECTIONS: Section[] = [
  {
    id: 'sec_summary',
    type: 'summary',
    title: 'Professional Summary',
    visible: true,
    data: {
      text: 'Driven Computer Science student with hands-on experience in full-stack web development and cloud architectures. Proven track record building responsive web applications with modern TypeScript, React, and Node.js. Passionate about writing clean, test-driven code and optimizing application performance.',
    },
  },
  {
    id: 'sec_education',
    type: 'education',
    title: 'Education',
    visible: true,
    data: {
      entries: [
        {
          id: 'edu_1',
          institution: 'National Institute of Technology',
          degree: 'Bachelor of Technology',
          field: 'Computer Science and Engineering',
          location: 'Bangalore, India',
          startDate: '2021-08',
          endDate: '2025-05',
          current: true,
          grade: '8.8 / 10 CGPA',
          details: [
            'Relevant coursework: Data Structures & Algorithms, Database Systems, Computer Networks, Operating Systems',
            'Dean\'s Honor List for academic excellence (top 5% of class)',
          ],
        },
      ],
    },
  },
  {
    id: 'sec_skills',
    type: 'skills',
    title: 'Technical Skills',
    visible: true,
    data: {
      groups: [
        {
          id: 'sk_lang',
          category: 'Programming Languages',
          items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL', 'C++'],
        },
        {
          id: 'sk_fw',
          category: 'Frameworks & Libraries',
          items: ['React', 'Next.js', 'Node.js', 'Express.js', 'Tailwind CSS', 'Redux'],
        },
        {
          id: 'sk_db',
          category: 'Databases & Cloud',
          items: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS (S3, EC2)', 'Git'],
        },
      ],
    },
  },
  {
    id: 'sec_experience',
    type: 'experience',
    title: 'Work Experience',
    visible: true,
    data: {
      entries: [
        {
          id: 'exp_1',
          role: 'Software Engineering Intern',
          organization: 'NexTech Solutions',
          location: 'Bangalore, India',
          startDate: '2024-05',
          endDate: '2024-07',
          current: false,
          bullets: [
            'Architected and implemented 12 RESTful microservice endpoints in TypeScript and Express, serving 25,000+ daily requests.',
            'Optimized MongoDB query performance and added Redis caching, decreasing median API response times by 38%.',
            'Engineered automated unit and integration test suites using Vitest, boosting code coverage from 62% to 89%.',
            'Collaborated with a cross-functional team of 6 engineers in bi-weekly Agile sprints to deliver product milestones on schedule.',
          ],
        },
      ],
    },
  },
  {
    id: 'sec_projects',
    type: 'projects',
    title: 'Projects',
    visible: true,
    data: {
      entries: [
        {
          id: 'proj_1',
          name: 'CampusHub — Student Collaboration Platform',
          link: 'https://github.com/example/campushub',
          techStack: ['React', 'TypeScript', 'Node.js', 'Socket.io', 'MongoDB'],
          startDate: '2023-09',
          endDate: '2023-12',
          bullets: [
            'Built a real-time collaboration hub connecting 1,200+ university students for peer mentoring and study group discovery.',
            'Designed WebSocket-based live messaging and event notifications with sub-50ms message latency.',
            'Implemented secure JWT authentication with refresh token rotation and role-based access control.',
          ],
        },
        {
          id: 'proj_2',
          name: 'FinTrack — Personal Finance Tracker',
          link: 'https://github.com/example/fintrack',
          techStack: ['Next.js', 'Tailwind CSS', 'PostgreSQL', 'Chart.js'],
          startDate: '2023-01',
          endDate: '2023-04',
          bullets: [
            'Developed an interactive expense visualization dashboard with automated spending categorization and monthly reports.',
            'Integrated OAuth 2.0 social login and encrypted financial record storage adhering to security best practices.',
            'Achieved 98+ Lighthouse performance score through server-side rendering and responsive Tailwind CSS layout.',
          ],
        },
      ],
    },
  },
  {
    id: 'sec_certifications',
    type: 'certifications',
    title: 'Certifications',
    visible: true,
    data: {
      entries: [
        {
          id: 'cert_1',
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          date: '2024-02',
          link: 'https://aws.amazon.com/verification',
        },
      ],
    },
  },
  {
    id: 'sec_achievements',
    type: 'achievements',
    title: 'Achievements',
    visible: true,
    data: {
      entries: [
        {
          id: 'ach_1',
          title: 'Finalist — National Smart India Hackathon (SIH)',
          date: '2023-11',
          description: 'Ranked in top 10 out of 450+ collegiate teams for delivering an AI-driven civic grievance management prototype.',
        },
      ],
    },
  },
];
