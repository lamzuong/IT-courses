import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'directions-getting-around',
  title: 'Hỏi đường & di chuyển',
  englishTitle: 'Directions & getting around',
  summary:
    'Hỏi đường, hiểu chỉ dẫn, dùng phương tiện công cộng, taxi và ridesharing — di chuyển tự tin trong thành phố nói tiếng Anh.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-asking-directions',
      title: 'Hỏi đường — câu mở đầu lịch sự',
      scene: 'Dừng người lạ trên phố để hỏi đường, hỏi nhân viên trong toà nhà.',
    },
    {
      slug: '02-understanding-directions',
      title: 'Hiểu chỉ dẫn — landmarks, hướng & khoảng cách',
      scene: 'Người ta đang chỉ đường cho bạn — nắm bắt landmark, "two blocks down", left/right.',
    },
    {
      slug: '03-public-transport',
      title: 'Phương tiện công cộng — metro, bus, train',
      scene: 'Mua vé, hỏi tuyến, đổi tuyến, "is this the right train?"',
    },
    {
      slug: '04-taxi-and-rideshare',
      title: 'Taxi & rideshare (Uber, Grab)',
      scene: 'Đặt xe, chỉ địa chỉ, đổi tuyến, đến nơi và thanh toán.',
    },
    {
      slug: '05-getting-lost-and-recovery',
      title: 'Lạc đường & khôi phục',
      scene: 'Nhận ra mình đi sai, hỏi lại, dùng Google Maps cùng người bản xứ.',
    },
    {
      slug: '06-airports-stations-hubs',
      title: 'Sân bay, ga, trung tâm vận chuyển — capstone',
      scene: 'Tìm đường trong sân bay/ga lớn, hỏi gate/platform, xử lý delay.',
    },
  ],
};
