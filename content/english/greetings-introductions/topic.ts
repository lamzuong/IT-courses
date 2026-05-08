import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'greetings-introductions',
  title: 'Chào hỏi & giới thiệu',
  englishTitle: 'Greetings & introductions',
  summary:
    'Mở đầu cuộc trò chuyện, giới thiệu bản thân và người khác trong các bối cảnh khác nhau — từ networking trang trọng đến gặp gỡ thân mật, online, và gặp lại sau lâu ngày.',
  level: 'B1+',
  variant: 'daily-life',
  memoryTip:
    'Nhớ công thức **3 lớp**: **Hi/Hello/Nice to meet you** → **I\'m [tên] from [bối cảnh]** → **What about you?**. Đổi tone bằng cách rút/giãn câu chứ không đổi từ — formal chỉ thêm "Pleased to meet you" và "How do you do?". Quên tên ai đó? Cụm cứu cánh: **"I\'m sorry, your name has just slipped my mind."**',
  lessons: [
    {
      slug: '01-first-meeting-formal',
      title: 'Lần đầu gặp — bối cảnh trang trọng',
      scene: 'Networking event, conference, business meeting — chào lần đầu, trao đổi danh thiếp.',
    },
    {
      slug: '02-first-meeting-casual',
      title: 'Lần đầu gặp — bối cảnh thân mật',
      scene: 'Tiệc bạn bè, hàng xóm mới, friend-of-a-friend — bắt chuyện tự nhiên.',
    },
    {
      slug: '03-introducing-others',
      title: 'Giới thiệu hai người với nhau',
      scene: 'Đóng vai "host" — giới thiệu đồng nghiệp với khách, bạn với bạn, kèm context một câu.',
    },
    {
      slug: '04-self-intro-in-context',
      title: 'Tự giới thiệu trong các bối cảnh khác nhau',
      scene: 'Phỏng vấn, ngày đầu đi làm, lớp học, stand-up meeting — chỉnh tone & độ dài.',
    },
    {
      slug: '05-reconnecting-and-names',
      title: 'Gặp lại sau lâu & xử lý khi quên tên',
      scene: 'Chạm mặt người quen sau nhiều năm, "Have we met?", thoát khỏi tình huống quên tên.',
    },
    {
      slug: '06-online-and-cultural-notes',
      title: 'Chào hỏi online & ghi chú văn hoá',
      scene: 'Email/LinkedIn/Slack đầu tiên, video call hello, khác biệt văn hoá về formality.',
    },
  ],
};
