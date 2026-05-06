import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EnglishTopic } from '@/content/english/types';

const fakeTopics: EnglishTopic[] = [
  {
    slug: 'restaurant-cafe',
    title: 'Nhà hàng & quán cà phê',
    englishTitle: 'Restaurant & café',
    summary: 'Test summary',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [
      { slug: '01-a', title: 'Lesson A' },
      { slug: '02-b', title: 'Lesson B' },
      { slug: '03-c', title: 'Lesson C' },
    ],
  },
  {
    slug: 'small-talk',
    title: 'Trò chuyện xã giao',
    englishTitle: 'Small talk',
    summary: 'Test',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
];

beforeEach(() => {
  vi.resetModules();
  // doMock is not hoisted — it runs after fakeTopics is defined, which is what we want.
  vi.doMock('@/content/english', () => ({ allEnglishTopics: fakeTopics }));
});

describe('getAllEnglishTopics', () => {
  it('returns all registered topics', async () => {
    const { getAllEnglishTopics } = await import('./english');
    expect(getAllEnglishTopics()).toHaveLength(2);
  });
});

describe('getEnglishTopic', () => {
  it('returns a topic by slug', async () => {
    const { getEnglishTopic } = await import('./english');
    expect(getEnglishTopic('restaurant-cafe')?.title).toBe('Nhà hàng & quán cà phê');
  });

  it('returns null for an unknown slug', async () => {
    const { getEnglishTopic } = await import('./english');
    expect(getEnglishTopic('nope')).toBeNull();
  });

  it('returns placeholder topics too', async () => {
    const { getEnglishTopic } = await import('./english');
    expect(getEnglishTopic('small-talk')?.placeholder).toBe(true);
  });
});

describe('flattenEnglishLessons', () => {
  it('returns the lessons array directly (no parts)', async () => {
    const { getEnglishTopic, flattenEnglishLessons } = await import('./english');
    const topic = getEnglishTopic('restaurant-cafe')!;
    const lessons = flattenEnglishLessons(topic);
    expect(lessons).toHaveLength(3);
    expect(lessons[0].slug).toBe('01-a');
  });
});

describe('getEnglishLesson', () => {
  it('returns lesson + neighbors for a middle lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    const ctx = getEnglishLesson('restaurant-cafe', '02-b');
    expect(ctx).not.toBeNull();
    expect(ctx!.lesson.title).toBe('Lesson B');
    expect(ctx!.prev?.slug).toBe('01-a');
    expect(ctx!.next?.slug).toBe('03-c');
    expect(ctx!.index).toBe(1);
    expect(ctx!.total).toBe(3);
  });

  it('returns null prev for the first lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    const ctx = getEnglishLesson('restaurant-cafe', '01-a');
    expect(ctx!.prev).toBeNull();
    expect(ctx!.next?.slug).toBe('02-b');
  });

  it('returns null next for the last lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    const ctx = getEnglishLesson('restaurant-cafe', '03-c');
    expect(ctx!.prev?.slug).toBe('02-b');
    expect(ctx!.next).toBeNull();
  });

  it('returns null for unknown topic or lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    expect(getEnglishLesson('nope', '01-a')).toBeNull();
    expect(getEnglishLesson('restaurant-cafe', 'nope')).toBeNull();
  });
});
