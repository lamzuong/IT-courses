import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'office-small-talk',
  title: 'Trò chuyện ở văn phòng',
  englishTitle: 'Office small talk',
  summary:
    'Chào buổi sáng, cuối tuần, mời ăn trưa, "office chat" mà không vượt giới hạn — small talk chuyên dụng cho môi trường công sở phương Tây.',
  level: 'B1+',
  variant: 'work',
  memoryTip:
    'Quy tắc **3 an toàn / 3 tránh**. **An toàn**: cuối tuần, đồ ăn, thời tiết & commute. **Tránh**: lương, chính trị, gossip cá nhân. Mỗi sáng dùng 1 mẫu duy nhất **"Morning! How\'s it going?"** — đừng sáng tạo trước cà phê. Thoát khỏi corridor chat trong 60 giây: **"Anyway, I should let you get back to it — catch you later!"**',
  lessons: [
    {
      slug: '01-good-mornings-and-greetings',
      title: 'Chào buổi sáng & gặp ở pantry',
      scene: 'Bắt đầu ngày, bumping vào đồng nghiệp ở bếp/coffee machine.',
    },
    {
      slug: '02-monday-rhythm',
      title: 'Nhịp thứ Hai — recap cuối tuần ở văn phòng',
      scene: '"How was your weekend?" — phiên bản công sở, calibrated cho đồng nghiệp.',
    },
    {
      slug: '03-lunch-invitations',
      title: 'Mời/nhận lời ăn trưa',
      scene: 'Đề xuất lunch với đồng nghiệp, nhận lời, đi nhóm vs. solo.',
    },
    {
      slug: '04-corridor-conversations',
      title: 'Hành lang & cầu thang — chat 60 giây',
      scene: 'Chạm mặt sếp/đồng nghiệp — chat ngắn không quá deep.',
    },
    {
      slug: '05-where-to-draw-the-line',
      title: 'Ranh giới — không vượt quá thân mật',
      scene: 'Topic an toàn vs. không an toàn ở văn phòng — chính trị, lương, gossip.',
    },
    {
      slug: '06-cultural-and-remote',
      title: 'Văn hoá & remote/hybrid — capstone',
      scene: 'Slack greetings, virtual coffee, cross-cultural office norms.',
    },
  ],
};
