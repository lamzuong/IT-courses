import { allCourses } from '@/content/courses';
import type { Course, LessonMeta } from '@/content/courses/types';

export function getAllCourses(): Course[] {
  return allCourses;
}

export function getCourse(slug: string): Course | null {
  return allCourses.find((c) => c.slug === slug) ?? null;
}

export function flattenLessons(course: Course): LessonMeta[] {
  return course.parts.flatMap((part) => part.lessons);
}

// Lesson slugs are prefixed with their canonical number (e.g. '00-technical-terms',
// '01-what-this-teaches'). Use that prefix as the displayed lesson number so a
// glossary at slug '00-…' renders as "00", not as a sequential "01".
// Recap pages use slugs like 'recap-part-1' and render as "R1", "R2", etc.
export function lessonNumberFromSlug(slug: string, fallback: number): string {
  const recap = slug.match(/^recap-part-(\d+)/);
  if (recap) return `R${recap[1]}`;
  const m = slug.match(/^(\d+)/);
  return (m ? m[1] : String(fallback)).padStart(2, '0');
}

export type LessonContext = {
  course: Course;
  lesson: LessonMeta;
  prev: LessonMeta | null;
  next: LessonMeta | null;
  index: number;   // zero-based position in flattened list
  total: number;
};

export function getLesson(courseSlug: string, lessonSlug: string): LessonContext | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return {
    course,
    lesson: lessons[index],
    prev: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
    index,
    total: lessons.length,
  };
}
