export type EnglishLessonMeta = {
  slug: string;        // matches MDX filename without extension
  title: string;       // displayed Vietnamese title
  scene?: string;      // optional scene tag, e.g., 'Vào quán & gọi đồ uống'
  summary?: string;    // optional one-liner
};

export type EnglishVariant = 'daily-life' | 'work';

export type EnglishTopic = {
  slug: string;
  title: string;            // displayed Vietnamese title
  englishTitle: string;     // for breadcrumb fallback / metadata
  summary: string;          // Vietnamese one-line summary
  level: 'B1+' | 'B2+';
  variant: EnglishVariant;
  lessons: EnglishLessonMeta[];
  placeholder?: boolean;
  plannedLessonCount?: number; // shown on placeholder cards when lessons.length === 0
};
