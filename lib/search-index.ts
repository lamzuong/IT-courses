import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { allCourses } from '@/content/courses';
import type { SearchRecord } from './search-types';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'courses');
const BODY_LIMIT = 1200;

function stripMdx(raw: string): string {
  const lines = raw.split('\n');
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^\s*(import|export)\s/.test(line)) continue;

    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      out.push(heading[1]);
      continue;
    }

    const cleaned = line
      .replace(/<\/?[A-Za-z][^>]*\/?>/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned) out.push(cleaned);
  }

  return out.join(' ').slice(0, BODY_LIMIT);
}

function readMdxBody(absPath: string): string {
  if (!existsSync(absPath)) return '';
  return stripMdx(readFileSync(absPath, 'utf8'));
}

let cached: SearchRecord[] | null = null;

export function getSearchIndex(): SearchRecord[] {
  if (cached) return cached;
  const records: SearchRecord[] = [];

  for (const course of allCourses) {
    const courseBody = [
      course.longDescription,
      course.whatYoullLearn.join(' '),
      course.whatYoullBuild,
    ]
      .join(' ')
      .slice(0, BODY_LIMIT);

    records.push({
      kind: 'course',
      href: `/courses/${course.slug}`,
      title: course.title,
      summary: course.summary,
      courseTitle: course.title,
      body: courseBody,
    });

    let n = 0;
    for (const part of course.parts) {
      for (const lesson of part.lessons) {
        n += 1;
        records.push({
          kind: 'lesson',
          href: `/courses/${course.slug}/lessons/${lesson.slug}`,
          title: lesson.title,
          summary: lesson.summary ?? '',
          courseTitle: course.title,
          partTitle: part.title,
          lessonNumber: n,
          body: readMdxBody(
            path.join(CONTENT_ROOT, course.slug, 'lessons', `${lesson.slug}.mdx`),
          ),
        });
      }
    }

    records.push({
      kind: 'project',
      href: `/courses/${course.slug}/project`,
      title: course.project.title,
      summary: course.whatYoullBuild,
      courseTitle: course.title,
      body: readMdxBody(path.join(CONTENT_ROOT, course.slug, 'project.mdx')),
    });
  }

  cached = records;
  return records;
}
