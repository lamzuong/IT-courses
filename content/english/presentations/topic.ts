import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'presentations',
  title: 'Thuyết trình',
  englishTitle: 'Presentations',
  summary:
    'Mở bài, dẫn dắt, trình bày dữ liệu, xử lý Q&A, chốt với call-to-action — tiếng Anh thuyết trình level B2+ cho công việc và sự kiện.',
  level: 'B2+',
  variant: 'work',
  lessons: [
    {
      slug: '01-opening-with-impact',
      title: 'Mở đầu thuyết trình có tác động',
      scene: 'Hook người nghe trong 30 giây đầu, state your purpose, roadmap.',
    },
    {
      slug: '02-structuring-and-signposting',
      title: 'Cấu trúc & signposting — dẫn dắt qua các phần',
      scene: '"First, second, finally", "Let me move on to…", connect ideas mạch lạc.',
    },
    {
      slug: '03-presenting-data-and-visuals',
      title: 'Trình bày dữ liệu & hình ảnh',
      scene: '"As you can see…", giải thích chart, kết luận từ dữ liệu.',
    },
    {
      slug: '04-handling-qa',
      title: 'Xử lý Q&A — câu hỏi khó',
      scene: 'Restate, answer, hostile question, không biết câu trả lời.',
    },
    {
      slug: '05-storytelling-and-engagement',
      title: 'Storytelling & giữ engagement',
      scene: 'Anecdote opener, rule-of-three, pause, emphasis cho impact.',
    },
    {
      slug: '06-closing-and-cta',
      title: 'Chốt với call-to-action — capstone',
      scene: 'Summary, key takeaway, ask, thank-you — capstone toàn topic.',
    },
  ],
};
