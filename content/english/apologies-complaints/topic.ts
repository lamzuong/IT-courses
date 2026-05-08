import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'apologies-complaints',
  title: 'Xin lỗi & phàn nàn',
  englishTitle: 'Apologies & complaints',
  summary:
    'Xin lỗi nhẹ và xin lỗi thật, phàn nàn lịch sự, leo thang đúng mức, giải quyết mâu thuẫn — tiếng Anh để giữ và sửa quan hệ.',
  level: 'B1+',
  variant: 'daily-life',
  memoryTip:
    'Phân biệt **2 loại sorry**: **"Sorry"** nhẹ (va người, đến muộn 5 phút) vs **"I owe you an apology"** nặng (làm tổn thương, lỡ deadline). Phàn nàn lịch sự luôn mở bằng **"I think there\'s been a mistake"** — đặt vấn đề, không đặt người. Sửa quan hệ theo công thức **acknowledge → apologise → repair**: nhận → xin lỗi → đề xuất bù đắp.',
  lessons: [
    {
      slug: '01-light-apologies',
      title: 'Xin lỗi nhẹ — bumping, lateness, small mistakes',
      scene: 'Va vào ai đó, đến muộn 5 phút, làm rơi bút — xin lỗi đúng độ.',
    },
    {
      slug: '02-real-apologies',
      title: 'Xin lỗi thật — khi đã làm sai',
      scene: 'Hủy phút chót, nói gì làm tổn thương, lỡ deadline — xin lỗi có trọng lượng.',
    },
    {
      slug: '03-polite-complaints',
      title: 'Phàn nàn lịch sự — "I think there\'s been a mistake"',
      scene: 'Vấn đề ở dịch vụ, nhà hàng, công việc — phàn nàn không kích động.',
    },
    {
      slug: '04-receiving-apologies-and-complaints',
      title: 'Nhận lời xin lỗi & phàn nàn',
      scene: 'Khi người khác xin lỗi bạn, hoặc phàn nàn với bạn — phản hồi đúng.',
    },
    {
      slug: '05-conflict-and-misunderstandings',
      title: 'Hiểu lầm & xung đột nhẹ',
      scene: 'Hai bên hiểu lầm, ai đó nóng nảy, làm dịu tình huống.',
    },
    {
      slug: '06-cultural-and-repair',
      title: 'Văn hoá & repair — capstone',
      scene: 'Văn hoá xin lỗi cross-culture, "I\'m sorry" vs "I apologize", repair after rupture.',
    },
  ],
};
