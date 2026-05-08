import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'doctor-health',
  title: 'Khám bệnh & sức khoẻ',
  englishTitle: 'Doctor & health',
  summary:
    'Đặt lịch khám, mô tả triệu chứng, hiểu chẩn đoán, hiệu thuốc và tình huống khẩn cấp — tiếng Anh y tế cho du lịch và đi làm việc.',
  level: 'B1+',
  variant: 'daily-life',
  memoryTip:
    'Mô tả triệu chứng theo **OPQRST**: **O**nset (khi nào bắt đầu), **P**rovokes (gì làm tệ hơn / đỡ hơn), **Q**uality (sharp / dull / throbbing), **R**egion (đau ở đâu, có lan không), **S**everity (1–10), **T**iming (liên tục hay từng cơn). Bác sĩ Anh–Mỹ hỏi đúng theo trật tự này. Không hiểu chẩn đoán? Câu cứu: **"Could you explain that in plain English?"**',
  lessons: [
    {
      slug: '01-booking-an-appointment',
      title: 'Đặt lịch khám',
      scene: 'Gọi clinic / GP, đặt lịch, hỏi insurance, walk-in vs appointment.',
    },
    {
      slug: '02-describing-symptoms',
      title: 'Mô tả triệu chứng — sharp / dull / on-and-off',
      scene: 'Trả lời câu hỏi của bác sĩ về triệu chứng, vị trí, mức độ, thời gian.',
    },
    {
      slug: '03-understanding-diagnosis',
      title: 'Hiểu chẩn đoán & kê đơn',
      scene: 'Bác sĩ giải thích, hỏi lại, hỏi side effects, follow-up plan.',
    },
    {
      slug: '04-pharmacy-and-prescriptions',
      title: 'Hiệu thuốc & toa thuốc',
      scene: 'Nộp toa, OTC, hỏi pharmacist về liều dùng, tương tác.',
    },
    {
      slug: '05-emergencies-and-urgent-care',
      title: 'Cấp cứu & urgent care',
      scene: '911/999/112, urgent care vs ER, triage, mô tả tình trạng nguy cấp.',
    },
    {
      slug: '06-insurance-and-cultural',
      title: 'Bảo hiểm & ghi chú văn hoá — capstone',
      scene: 'Insurance basics, billing surprises, cross-cultural healthcare notes.',
    },
  ],
};
