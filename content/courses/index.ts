import { course as dragDropReact } from './drag-drop-react/course';
import { course as aiInYourProject } from './ai-in-your-project/course';
import { course as langchainLanggraphToolkit } from './langchain-langgraph-toolkit/course';
import type { Course } from './types';

export const allCourses: Course[] = [aiInYourProject, langchainLanggraphToolkit, dragDropReact];

export type PlaceholderCourse = {
  title: string;
  summary: string;
  tag: string;
  authoringPct: number;
  lessons: number;
  demos: number;
  status: string;
};

// Two placeholders remain (the third — TypeScript for React engineers — has been
// replaced by the AI in Your Project course, which is now real).
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
];
