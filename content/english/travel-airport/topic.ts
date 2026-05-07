import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'travel-airport',
  title: 'Du lịch & sân bay',
  englishTitle: 'Travel & airport',
  summary:
    'Check-in, an ninh, lên máy bay, hải quan, hành lý thất lạc và delay — tiếng Anh đi máy bay từ khi đến sân bay tới khi nhận hành lý.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-checkin-and-baggage',
      title: 'Check-in & hành lý',
      scene: 'Quầy check-in, online check-in trục trặc, hành lý quá cân, đặt chỗ ngồi.',
    },
    {
      slug: '02-security-and-customs',
      title: 'An ninh & hải quan',
      scene: 'Soi an ninh, tháo giày/laptop, khai báo hải quan, câu hỏi của officer.',
    },
    {
      slug: '03-boarding-and-onboard',
      title: 'Lên máy bay & trên khoang',
      scene: 'Boarding pass, gate change, in-flight requests, nhờ tiếp viên đổi chỗ.',
    },
    {
      slug: '04-delays-and-missed-flights',
      title: 'Delay & lỡ chuyến',
      scene: 'Chuyến bị hoãn, lỡ chuyến nối, đặt lại chỗ, ghế chờ qua đêm.',
    },
    {
      slug: '05-lost-baggage-and-help',
      title: 'Lạc hành lý & xin trợ giúp',
      scene: 'Hành lý không về, file PIR, theo dõi tracker, đòi compensation.',
    },
    {
      slug: '06-arrival-and-cultural',
      title: 'Đến nơi & ghi chú văn hoá — capstone',
      scene: 'Nhập cảnh, taxi từ sân bay, jet lag, ghi chú văn hoá du lịch.',
    },
  ],
};
