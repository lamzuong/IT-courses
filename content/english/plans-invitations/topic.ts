import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'plans-invitations',
  title: 'Hẹn hò & lời mời',
  englishTitle: 'Plans & invitations',
  summary:
    'Đề xuất kế hoạch, mời, nhận lời, từ chối lịch sự, đổi lịch — kỹ năng làm chủ lịch sinh hoạt xã hội bằng tiếng Anh.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-floating-an-idea',
      title: 'Thả ý tưởng — "What if we…?"',
      scene: 'Đề xuất nhẹ một kế hoạch trước khi mời chính thức — đo độ hứng thú.',
    },
    {
      slug: '02-formal-invitations',
      title: 'Lời mời chính thức — sinh nhật, đám cưới, tiệc',
      scene: 'Mời và RSVP cho sự kiện có ngày giờ địa điểm cụ thể.',
    },
    {
      slug: '03-saying-yes-with-warmth',
      title: 'Nhận lời với độ ấm phù hợp',
      scene: 'Nhận lời mời — từ "Sure!" tới "I would love to" — lựa chọn theo bối cảnh.',
    },
    {
      slug: '04-saying-no-gracefully',
      title: 'Từ chối lịch sự — không lạnh, không tội lỗi',
      scene: 'Khi không đi được, không muốn đi, hoặc cần ra khỏi kế hoạch lỡ nhận.',
    },
    {
      slug: '05-rescheduling-and-cancelling',
      title: 'Đổi lịch & huỷ — short-notice ok',
      scene: 'Phải đổi giờ, huỷ vào phút chót, đổi địa điểm — giữ relationship.',
    },
    {
      slug: '06-cultural-and-followup',
      title: 'Văn hoá & follow-up — capstone',
      scene: 'Văn hoá đúng giờ, "Let\'s grab coffee sometime" thực vs. xã giao, follow-up.',
    },
  ],
};
