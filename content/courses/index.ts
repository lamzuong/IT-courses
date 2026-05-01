import { course as dragDropReact } from './drag-drop-react/course';
import type { Course } from './types';

export const allCourses: Course[] = [dragDropReact];

export type PlaceholderCourse = {
  title: string;
  summary: string;
  tag: string;
  authoringPct: number;
  lessons: number;
  demos: number;
  status: string;
};

export const placeholderCourses: PlaceholderCourse[] = [
  {
    title: 'Animations in React',
    summary: 'CSS, Motion, FLIP, scroll-driven choreography. From transitions to orchestrated layouts.',
    tag: 'Drafting',
    authoringPct: 35,
    lessons: 14,
    demos: 9,
    status: 'In progress',
  },
  {
    title: 'Accessible UIs from scratch',
    summary: 'WAI-ARIA patterns, keyboard models, focus management. Build a real component library.',
    tag: 'Planned',
    authoringPct: 8,
    lessons: 16,
    demos: 11,
    status: 'Planned',
  },
  {
    title: 'TypeScript for React engineers',
    summary: 'Generics, conditional types, and the patterns that actually pay off in component libraries.',
    tag: 'Planned',
    authoringPct: 0,
    lessons: 12,
    demos: 8,
    status: 'Planned',
  },
];
