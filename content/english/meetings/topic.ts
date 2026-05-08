import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'meetings',
  title: 'Họp',
  englishTitle: 'Meetings',
  summary:
    'Mở đầu, cập nhật/đề xuất, đồng ý/không đồng ý lịch sự, ngắt lời, chốt action items — tiếng Anh để dẫn dắt và đóng góp trong cuộc họp.',
  level: 'B1+',
  variant: 'work',
  memoryTip:
    'Cuộc họp = **4 động từ**: **open → update → discuss → close**. Mỗi động từ có 1 cụm cứu cánh: **"Let\'s get started"** / **"Quick update from my side"** / **"I see it differently, but…"** / **"To wrap up — action items are…"**. Học 4 cụm là dẫn được họp. Update kiểu stand-up: **3 phần** — done / next / blockers, mỗi phần 1 câu.',
  lessons: [
    {
      slug: '01-meeting-openers',
      title: 'Mở đầu cuộc họp',
      scene: 'Chair mở họp, đi qua agenda, "Let\'s get started" + giới thiệu mục tiêu.',
    },
    {
      slug: '02-giving-updates',
      title: 'Cập nhật ngắn — status report style',
      scene: 'Stand-up update, project status: 3 phần "what done / next / blockers".',
    },
    {
      slug: '03-proposing-and-discussing',
      title: 'Đề xuất & thảo luận ý tưởng',
      scene: '"What if we…?" trong họp, phản hồi đề xuất, tinh chỉnh chung.',
    },
    {
      slug: '04-agreeing-and-disagreeing',
      title: 'Đồng ý & không đồng ý lịch sự',
      scene: 'Hỗ trợ đề xuất, đề xuất khác, "I see it differently" — không đối đầu.',
    },
    {
      slug: '05-interrupting-and-yielding',
      title: 'Ngắt lời & nhường lời lịch sự',
      scene: 'Cách ngắt khi cần, để người khác nói trước, time-box.',
    },
    {
      slug: '06-closing-and-action-items',
      title: 'Chốt cuộc họp & action items — capstone',
      scene: 'Tóm tắt, ai làm gì khi nào, follow-up bằng email — capstone.',
    },
  ],
};
