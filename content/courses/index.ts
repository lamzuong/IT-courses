import { course as dragDropReact } from './drag-drop-react/course';
import type { Course } from './types';

export const allCourses: Course[] = [dragDropReact];

export const placeholderCourses: { title: string; summary: string }[] = [
  { title: 'Coming soon', summary: 'Another course is in the works.' },
  { title: 'Coming soon', summary: 'Another course is in the works.' },
];
