import type { EnglishTopic } from './types';
import { topic as greetingsIntroductions } from './greetings-introductions/topic';
import { topic as restaurantCafe } from './restaurant-cafe/topic';
import { placeholderTopics } from './_placeholders';

export const allEnglishTopics: EnglishTopic[] = [
  // Topic 1 (real)
  greetingsIntroductions,
  // Topic 2 (placeholder)
  placeholderTopics.find((t) => t.slug === 'small-talk')!,
  // Topic 3 (real — pilot)
  restaurantCafe,
  // Topics 4–11 (placeholders, daily-life)
  placeholderTopics.find((t) => t.slug === 'shopping-money')!,
  placeholderTopics.find((t) => t.slug === 'directions-getting-around')!,
  placeholderTopics.find((t) => t.slug === 'phone-video-calls')!,
  placeholderTopics.find((t) => t.slug === 'travel-airport')!,
  placeholderTopics.find((t) => t.slug === 'hotel')!,
  placeholderTopics.find((t) => t.slug === 'doctor-health')!,
  placeholderTopics.find((t) => t.slug === 'plans-invitations')!,
  placeholderTopics.find((t) => t.slug === 'apologies-complaints')!,
  // Topics 12–15 (placeholders, work)
  placeholderTopics.find((t) => t.slug === 'office-small-talk')!,
  placeholderTopics.find((t) => t.slug === 'meetings')!,
  placeholderTopics.find((t) => t.slug === 'job-interview')!,
  placeholderTopics.find((t) => t.slug === 'presentations')!,
];
