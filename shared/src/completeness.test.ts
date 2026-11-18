import { describe, it, expect } from 'vitest';
import { calculateCompleteness } from '../src/completeness.js';
import type { PersonalInfo, Section } from '../src/schemas/section.js';

describe('calculateCompleteness', () => {
  it('returns 0 for empty personal info and no sections', () => {
    const personalInfo: PersonalInfo = {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      links: [],
    };
    const sections: Section[] = [];

    const score = calculateCompleteness(personalInfo, sections);
    expect(score).toBe(0);
  });

  it('calculates full score for complete resume', () => {
    const personalInfo: PersonalInfo = {
      fullName: 'Aarav Mehta',
      headline: 'Software Engineer',
      email: 'aarav@example.com',
      phone: '+91 9876543210',
      location: 'Bangalore, India',
      links: [{ id: '1', label: 'GitHub', url: 'https://github.com/aarav' }],
    };

    const sections: Section[] = [
      {
        id: 's1',
        type: 'education',
        title: 'Education',
        visible: true,
        data: {
          entries: [
            {
              id: 'e1',
              institution: 'IIT',
              degree: 'B.Tech',
              field: 'CSE',
              location: 'Delhi',
              startDate: '2020-08',
              endDate: '2024-05',
              current: false,
              grade: '8.5 CGPA',
              details: [],
            },
          ],
        },
      },
      {
        id: 's2',
        type: 'skills',
        title: 'Skills',
        visible: true,
        data: {
          groups: [
            {
              id: 'g1',
              category: 'Languages',
              items: ['TypeScript', 'Python'],
            },
          ],
        },
      },
      {
        id: 's3',
        type: 'experience',
        title: 'Experience',
        visible: true,
        data: {
          entries: [
            {
              id: 'exp1',
              role: 'SDE Intern',
              organization: 'Acme Corp',
              location: 'Remote',
              startDate: '2023-05',
              endDate: '2023-08',
              current: false,
              bullets: ['Developed REST APIs'],
            },
          ],
        },
      },
      {
        id: 's4',
        type: 'projects',
        title: 'Projects',
        visible: true,
        data: {
          entries: [
            {
              id: 'p1',
              name: 'SmartResume',
              link: 'https://github.com/smartresume',
              techStack: ['React', 'Node.js'],
              startDate: '2024-01',
              endDate: '',
              bullets: ['Built fullstack application'],
            },
          ],
        },
      },
      {
        id: 's5',
        type: 'certifications',
        title: 'Certifications',
        visible: true,
        data: {
          entries: [
            {
              id: 'c1',
              name: 'AWS Certified Developer',
              issuer: 'AWS',
              date: '2023-10',
              link: '',
            },
          ],
        },
      },
    ];

    const score = calculateCompleteness(personalInfo, sections);
    // 15 (contact) + 10 (headline) + 15 (edu) + 15 (skills) + 15 (exp) + 15 (proj) + 5 (link) + 10 (cert) = 100
    expect(score).toBe(100);
  });
});
