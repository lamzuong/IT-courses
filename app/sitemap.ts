import type { MetadataRoute } from 'next';
import { getAllCourses, flattenLessons } from '@/lib/courses';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://it-courses.vercel.app';
  const entries: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'weekly', priority: 1.0 }];
  for (const course of getAllCourses()) {
    entries.push({ url: `${base}/courses/${course.slug}`, changeFrequency: 'weekly', priority: 0.9 });
    entries.push({ url: `${base}/courses/${course.slug}/project`, changeFrequency: 'monthly', priority: 0.7 });
    for (const lesson of flattenLessons(course)) {
      entries.push({ url: `${base}/courses/${course.slug}/lessons/${lesson.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    }
  }
  return entries;
}
