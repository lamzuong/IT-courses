import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'restaurant-cafe',
  title: 'Nhà hàng & quán cà phê',
  englishTitle: 'Restaurant & café',
  summary:
    'Đặt bàn, gọi món, hỏi về thực đơn, xử lý vấn đề và thanh toán — tất cả trong tiếng Anh tự nhiên, lịch sự.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-getting-seated',
      title: 'Vào quán & gọi đồ uống đầu',
      scene: 'Bước vào quán, được dẫn bàn, gọi đồ uống.',
    },
    {
      slug: '02-menu-and-dietary',
      title: 'Hỏi về thực đơn & ăn kiêng',
      scene: 'Hỏi món, dị ứng, chế độ ăn riêng (chay, không gluten…).',
    },
    {
      slug: '03-ordering-customizing',
      title: 'Gọi món & yêu cầu thay đổi',
      scene: 'Đặt món chính, sửa nguyên liệu, chia phần.',
    },
    {
      slug: '04-during-the-meal',
      title: 'Trong bữa ăn — yêu cầu, vấn đề, trò chuyện nhỏ',
      scene: 'Xin thêm đồ, phàn nàn nhẹ nhàng, trò chuyện với phục vụ.',
    },
    {
      slug: '05-paying-tipping-leaving',
      title: 'Thanh toán, tip & rời quán',
      scene: 'Xin hoá đơn, chia tiền, tip, lời chào tạm biệt.',
    },
    {
      slug: '06-cultural-notes-idioms',
      title: 'Văn hoá & idiom',
      scene: 'Khác biệt văn hoá ăn uống, idiom liên quan đến đồ ăn.',
    },
  ],
};
