import type { EnglishTopic } from './types';
import { topic as greetingsIntroductions } from './greetings-introductions/topic';
import { topic as smallTalk } from './small-talk/topic';
import { topic as restaurantCafe } from './restaurant-cafe/topic';
import { topic as shoppingMoney } from './shopping-money/topic';
import { topic as directionsGettingAround } from './directions-getting-around/topic';
import { topic as phoneVideoCalls } from './phone-video-calls/topic';
import { placeholderTopics } from './_placeholders';

export const allEnglishTopics: EnglishTopic[] = [
  // Topic 1 (real)
  greetingsIntroductions,
  // Topic 2 (real)
  smallTalk,
  // Topic 3 (real — pilot)
  restaurantCafe,
  // Topic 4 (real)
  shoppingMoney,
  // Topic 5 (real)
  directionsGettingAround,
  // Topic 6 (real)
  phoneVideoCalls,
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
