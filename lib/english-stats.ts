import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { EnglishTopic } from '@/content/english/types';

export type LessonStats = { words: number; readMinutes: number };

export async function getEnglishLessonStats(
  topicSlug: string,
  lessonSlug: string,
): Promise<LessonStats | null> {
  const file = path.join(
    process.cwd(),
    'content',
    'english',
    topicSlug,
    'lessons',
    `${lessonSlug}.mdx`,
  );
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    return null;
  }
  const prose = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/import\s.+?;/g, ' ')
    .replace(/[#*_>\-=|]+/g, ' ');
  const words = prose.split(/\s+/).filter((w) => w.length > 1).length;
  return { words, readMinutes: Math.max(1, Math.round(words / 220)) };
}

export async function getEnglishTopicStats(
  topic: EnglishTopic,
): Promise<{ totalMinutes: number; perLesson: Record<string, number> }> {
  const slugs = topic.lessons.map((l) => l.slug);
  const stats = await Promise.all(
    slugs.map((s) => getEnglishLessonStats(topic.slug, s)),
  );
  const perLesson: Record<string, number> = {};
  let totalMinutes = 0;
  slugs.forEach((slug, i) => {
    const m = stats[i]?.readMinutes ?? 0;
    perLesson[slug] = m;
    totalMinutes += m;
  });
  return { totalMinutes, perLesson };
}
