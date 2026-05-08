import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'job-interview',
  title: 'Phỏng vấn xin việc',
  englishTitle: 'Job interview',
  summary:
    'Tự giới thiệu, kinh nghiệm, điểm yếu, câu hỏi cho nhà tuyển dụng, lương & bước tiếp theo — tiếng Anh phỏng vấn cho người Việt level B2+.',
  level: 'B2+',
  variant: 'work',
  memoryTip:
    'Mọi câu hỏi behavioral đi theo **STAR**: **S**ituation (1 câu) → **T**ask (1 câu) → **A**ction (2–3 câu) → **R**esult (1 câu, có số). 80% thời gian rơi vào **A & R** — luyện kể về hành động cụ thể của **BẠN**, không phải team. "Tell me about yourself" = **3 phần Past–Present–Future** trong 90 giây. Đàm phán lương: **"Based on my research, I was thinking in the range of X to Y."**',
  lessons: [
    {
      slug: '01-self-intro-and-tell-me-about-yourself',
      title: 'Tự giới thiệu — "Tell me about yourself"',
      scene: '90-giây pitch về bạn — không phải CV recap, mà là "story of you".',
    },
    {
      slug: '02-experience-and-star',
      title: 'Kinh nghiệm — STAR framework',
      scene: 'Trả lời câu hỏi behavioral với Situation/Task/Action/Result.',
    },
    {
      slug: '03-strengths-and-weaknesses',
      title: 'Điểm mạnh & điểm yếu',
      scene: '"What\'s your greatest weakness?" — trả lời thật mà thông minh.',
    },
    {
      slug: '04-questions-for-the-interviewer',
      title: 'Câu hỏi của bạn cho nhà tuyển dụng',
      scene: '"Do you have any questions for us?" — câu hỏi tốt = candidate tốt.',
    },
    {
      slug: '05-salary-and-negotiation',
      title: 'Lương & đàm phán',
      scene: '"What\'s your expected salary?" — trả lời và đàm phán không lúng túng.',
    },
    {
      slug: '06-followup-and-close',
      title: 'Follow-up & đóng — capstone',
      scene: 'Thank-you note, follow-up timing, accept/decline offers.',
    },
  ],
};
