import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'phone-video-calls',
  title: 'Gọi điện & gọi video',
  englishTitle: 'Phone & video calls',
  summary:
    'Mở/kết thúc cuộc gọi, để lại tin nhắn, xử lý kết nối kém, video-call etiquette — kỹ năng audio-only và video-call cho công việc và đời sống.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-answering-and-opening',
      title: 'Nhận máy & mở đầu cuộc gọi',
      scene: '"Hello, this is…", giới thiệu, xác nhận đúng người, mục đích gọi.',
    },
    {
      slug: '02-leaving-voicemail',
      title: 'Để lại voicemail & tin nhắn',
      scene: 'Tóm tắt mục đích trong 30 giây, để lại số gọi lại, kết thúc rõ ràng.',
    },
    {
      slug: '03-bad-connection',
      title: 'Kết nối kém — xin lặp lại, mute, dropped calls',
      scene: 'Sóng yếu, "you\'re cutting out", tín hiệu mất, gọi lại.',
    },
    {
      slug: '04-video-call-etiquette',
      title: 'Video call etiquette — Zoom, Meet, Teams',
      scene: 'Bật/tắt mic-camera, raise hand, screen share, lighting & background.',
    },
    {
      slug: '05-difficult-conversations',
      title: 'Cuộc gọi khó — phàn nàn, từ chối, leo thang',
      scene: 'Customer-service phone, từ chối lời mời gọi điện, escalation lịch sự.',
    },
    {
      slug: '06-closing-and-cultural',
      title: 'Kết thúc & ghi chú văn hoá — capstone',
      scene: 'Kết thúc gọn gàng, follow-up qua email, khác biệt văn hoá phone vs. text.',
    },
  ],
};
