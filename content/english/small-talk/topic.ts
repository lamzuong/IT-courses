import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'small-talk',
  title: 'Trò chuyện xã giao',
  englishTitle: 'Small talk',
  summary:
    'Bắt đầu, duy trì và kết thúc cuộc trò chuyện ngắn một cách tự nhiên — từ thang máy, hàng đợi cà phê đến tiệc cocktail và networking event.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-opening-moments',
      title: 'Khoảnh khắc mở đầu — thang máy, hàng đợi, sảnh chờ',
      scene: 'Cuộc trò chuyện 30–90 giây với người lạ hoặc đồng nghiệp ít gặp.',
    },
    {
      slug: '02-weekend-recap',
      title: 'Cuối tuần & "How was your weekend?"',
      scene: 'Trao đổi nhẹ ở văn phòng sáng thứ Hai về kế hoạch cuối tuần.',
    },
    {
      slug: '03-work-casually',
      title: 'Nói về công việc một cách nhẹ nhàng',
      scene: 'Tiệc, friend-of-friend hỏi "what do you do?" — trả lời mà không thành CV.',
    },
    {
      slug: '04-shared-interests',
      title: 'Sở thích chung — đồ ăn, du lịch, sách phim',
      scene: 'Bữa tối chung mà bạn chưa quen hết mọi người.',
    },
    {
      slug: '05-current-events-safe',
      title: 'Tin tức an toàn — thể thao, phim, ẩm thực',
      scene: 'Cocktail hour / reception — chủ đề an toàn, tránh chính trị.',
    },
    {
      slug: '06-graceful-exits',
      title: 'Thoát khỏi cuộc trò chuyện lịch sự',
      scene: 'Networking event — khi cần kết thúc và move on, không bỏ ngang.',
    },
  ],
};
