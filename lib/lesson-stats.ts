import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type LessonStats = { words: number; readMinutes: number };

export async function getLessonStats(courseSlug: string, lessonSlug: string): Promise<LessonStats | null> {
  const file = path.join(process.cwd(), 'content', 'courses', courseSlug, 'lessons', `${lessonSlug}.mdx`);
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

export async function getCourseStats(
  courseSlug: string,
  parts: { lessons: { slug: string }[] }[],
): Promise<{ totalMinutes: number; perLesson: Record<string, number> }> {
  const slugs = parts.flatMap((p) => p.lessons.map((l) => l.slug));
  const stats = await Promise.all(slugs.map((s) => getLessonStats(courseSlug, s)));
  const perLesson: Record<string, number> = {};
  let totalMinutes = 0;
  slugs.forEach((slug, i) => {
    const m = stats[i]?.readMinutes ?? 0;
    perLesson[slug] = m;
    totalMinutes += m;
  });
  return { totalMinutes, perLesson };
}

const ROMAN: [number, string][] = [
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];
export function toRoman(n: number): string {
  let out = '';
  let rem = n;
  for (const [v, s] of ROMAN) {
    while (rem >= v) { out += s; rem -= v; }
  }
  return out;
}

export function partOfLesson(
  parts: { title: string; lessons: { slug: string }[] }[],
  lessonSlug: string,
): { partIndex: number; partTitle: string } | null {
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].lessons.some((l) => l.slug === lessonSlug)) {
      return { partIndex: i, partTitle: parts[i].title };
    }
  }
  return null;
}
