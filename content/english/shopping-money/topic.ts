import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'shopping-money',
  title: 'Mua sắm & tiền bạc',
  englishTitle: 'Shopping & money',
  summary:
    'Hỏi giá, thử đồ, mặc cả nhẹ nhàng, thanh toán, đổi trả và xử lý phàn nàn — tất cả trong tiếng Anh tự nhiên với phong cách lịch sự phù hợp với cửa hàng phương Tây.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-browsing-and-asking',
      title: 'Xem hàng & hỏi nhân viên',
      scene: 'Vào cửa hàng, "Just looking", hỏi nhờ tìm món, hỏi còn hàng.',
    },
    {
      slug: '02-fitting-rooms-sizes',
      title: 'Phòng thử & kích cỡ',
      scene: 'Tìm size, thử đồ, hỏi sửa, hỏi màu khác.',
    },
    {
      slug: '03-prices-and-bargaining',
      title: 'Giá cả & mặc cả nhẹ',
      scene: 'Hỏi giá, hỏi giảm giá, mặc cả ở chợ vs. giá cố định.',
    },
    {
      slug: '04-paying-and-cards',
      title: 'Thanh toán & thẻ',
      scene: 'Quẹt thẻ, tap, chia tiền, thẻ bị từ chối, tiền tệ.',
    },
    {
      slug: '05-returns-exchanges-refunds',
      title: 'Đổi trả & hoàn tiền',
      scene: 'Mang đồ trả, hỏi chính sách, hoá đơn, đổi size khác.',
    },
    {
      slug: '06-complaints-and-escalations',
      title: 'Phàn nàn & leo thang lịch sự',
      scene: 'Đồ lỗi, sai mô tả, gặp quản lý — capstone về escalation lịch sự.',
    },
  ],
};
