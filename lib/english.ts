import { allEnglishTopics } from '@/content/english';
import type { EnglishTopic, EnglishLessonMeta } from '@/content/english/types';

export function getAllEnglishTopics(): EnglishTopic[] {
  return allEnglishTopics;
}

export function getEnglishTopic(slug: string): EnglishTopic | null {
  return allEnglishTopics.find((t) => t.slug === slug) ?? null;
}

export function flattenEnglishLessons(topic: EnglishTopic): EnglishLessonMeta[] {
  return topic.lessons;
}

export type EnglishLessonContext = {
  topic: EnglishTopic;
  lesson: EnglishLessonMeta;
  prev: EnglishLessonMeta | null;
  next: EnglishLessonMeta | null;
  index: number;
  total: number;
};

export function getEnglishLesson(
  topicSlug: string,
  lessonSlug: string,
): EnglishLessonContext | null {
  const topic = getEnglishTopic(topicSlug);
  if (!topic) return null;
  const lessons = flattenEnglishLessons(topic);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return {
    topic,
    lesson: lessons[index],
    prev: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
    index,
    total: lessons.length,
  };
}
