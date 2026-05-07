import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'hotel',
  title: 'Khách sạn & nơi ở',
  englishTitle: 'Hotel & accommodation',
  summary:
    'Đặt phòng, check-in, hỏi tiện nghi, xử lý vấn đề trong phòng và check-out — tiếng Anh khách sạn cho công tác và du lịch.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-booking-and-pre-arrival',
      title: 'Đặt phòng & trước khi đến',
      scene: 'Đặt online/qua điện thoại, hỏi available, sửa booking, special requests.',
    },
    {
      slug: '02-check-in',
      title: 'Check-in & nhận phòng',
      scene: 'Đến quầy lễ tân, ID, deposit, key cards, hỏi tiện nghi.',
    },
    {
      slug: '03-asking-amenities-and-services',
      title: 'Hỏi tiện nghi & dịch vụ',
      scene: 'WiFi, breakfast, gym, laundry, room service, late check-out.',
    },
    {
      slug: '04-problems-in-the-room',
      title: 'Vấn đề trong phòng — lịch sự nhưng dứt khoát',
      scene: 'WiFi không chạy, AC hỏng, ồn, mất nước nóng — gọi xuống lễ tân.',
    },
    {
      slug: '05-housekeeping-and-extras',
      title: 'Housekeeping & yêu cầu thêm',
      scene: 'Xin thêm khăn, dọn phòng sau, do not disturb, nhờ giặt là.',
    },
    {
      slug: '06-checkout-and-cultural',
      title: 'Check-out & ghi chú văn hoá — capstone',
      scene: 'Trả phòng, thanh toán, đánh giá, văn hoá tipping ở khách sạn.',
    },
  ],
};
