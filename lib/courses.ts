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
