import { getAllCourses } from './courses';
import { getAllEnglishTopics } from './english';

export type BookmarkInfo = {
  path: string;
  lessonTitle: string;
  sectionType: 'course' | 'english';
  sectionSlug: string;
  sectionTitle: string;
};

export type BookmarkLookup = Record<string, BookmarkInfo>;

export function buildBookmarkLookup(): BookmarkLookup {
  const lookup: BookmarkLookup = {};

  for (const course of getAllCourses()) {
    for (const part of course.parts) {
      for (const lesson of part.lessons) {
        const path = `/courses/${course.slug}/lessons/${lesson.slug}`;
        lookup[path] = {
          path,
          lessonTitle: lesson.title,
          sectionType: 'course',
          sectionSlug: course.slug,
          sectionTitle: course.title,
        };
      }
    }
  }

  for (const topic of getAllEnglishTopics()) {
    if (topic.placeholder) continue;
    for (const lesson of topic.lessons) {
      const path = `/english/${topic.slug}/lessons/${lesson.slug}`;
      lookup[path] = {
        path,
        lessonTitle: lesson.title,
        sectionType: 'english',
        sectionSlug: topic.slug,
        sectionTitle: topic.title,
      };
    }
  }

  return lookup;
}
