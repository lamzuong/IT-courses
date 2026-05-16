export type ChineseLessonMeta = {
  slug: string;
  title: string;
  summary: string;
};

export type ChineseTopic = {
  title: string;
  summary: string;
  lessons: ChineseLessonMeta[]; // empty array = planned, not yet written
};

export type ChineseLanguage = {
  slug: 'cantonese' | 'mandarin';
  title: string;
  nativeName: string;
  vietnameseName: string;
  region: string;
  summary: string;
  topics: ChineseTopic[];
};

export const CHINESE_LANGUAGES: ChineseLanguage[] = [
  {
    slug: 'mandarin',
    title: 'Mandarin',
    nativeName: '普通话',
    vietnameseName: 'Tiếng Phổ Thông',
    region: 'Mainland China · Taiwan · Singapore',
    summary:
      'Tiếng Trung tiêu chuẩn — dùng trong giáo dục, truyền thông, công việc xuyên biên giới. 4 thanh điệu, viết bằng Hán tự giản thể (giản) hoặc phồn thể.',
    topics: [
      {
        title: 'Chào hỏi & giới thiệu',
        summary: '你好, 我叫… — mẫu câu mở đầu mọi cuộc nói chuyện.',
        lessons: [
          {
            slug: '01-chao-hoi-co-ban',
            title: 'Bài 1 — Chào hỏi cơ bản',
            summary: 'Năm câu chào, một đoạn hội thoại ngắn, và cách hỏi tên.',
          },
          {
            slug: '02-loi-chao-trang-trong',
            title: 'Bài 2 — Lời chào trang trọng & xưng hô',
            summary: '您好, 老师, 经理 — chào người lớn tuổi, sếp, đồng nghiệp đúng cách.',
          },
        ],
      },
      {
        title: 'Số đếm & thời gian',
        summary: 'Đọc số, giờ, ngày tháng — nền của mọi giao dịch hàng ngày.',
        lessons: [
          {
            slug: '03-so-dem-thoi-gian',
            title: 'Bài 3 — Số đếm 1-100 & giờ giấc',
            summary: 'Đếm tiền, xem đồng hồ, hẹn giờ — bốn câu là sống được.',
          },
          {
            slug: '13-ngay-thang-lich',
            title: 'Bài 13 — Ngày, tháng & lịch',
            summary: '今天几号? 星期几? — đọc ngày tháng, thứ trong tuần, mùa, năm.',
          },
        ],
      },
      {
        title: 'Nhà hàng & gọi món',
        summary: 'Đặt bàn, gọi món, hỏi giá, thanh toán.',
        lessons: [
          {
            slug: '04-nha-hang-goi-mon',
            title: 'Bài 4 — Nhà hàng: gọi món & thanh toán',
            summary: '服务员! 这个 — gọi nhân viên, chỉ món trên menu, gọi tính tiền.',
          },
          {
            slug: '14-van-hoa-an-uong',
            title: 'Bài 14 — Văn hoá ăn uống & món địa phương',
            summary: '川菜, 粤菜, 北方菜 — gọi món theo vùng, văn hoá uống trà, kiêng kỵ trên bàn ăn.',
          },
        ],
      },
      {
        title: 'Đi lại & chỉ đường',
        summary: 'Bắt taxi, đi tàu điện ngầm, hỏi đường.',
        lessons: [
          {
            slug: '05-taxi-tau-dien-ngam',
            title: 'Bài 5 — Taxi, metro & hỏi đường',
            summary: '请到… — đưa địa chỉ cho tài xế, đọc bảng tàu điện, hỏi đường rẽ trái rẽ phải.',
          },
          {
            slug: '15-dat-xe-san-bay',
            title: 'Bài 15 — Đặt xe online & sân bay',
            summary: 'Đặt Didi, check-in sân bay, hỏi cổng bay, lấy hành lý — đi xa Trung Quốc.',
          },
        ],
      },
      {
        title: 'Mua sắm & mặc cả',
        summary: 'Hỏi giá, đổi size, thương lượng — sống sót ở chợ đêm.',
        lessons: [
          {
            slug: '06-mua-sam-mac-ca',
            title: 'Bài 6 — Mua sắm & mặc cả',
            summary: '多少钱? 太贵了! — hỏi giá, mặc cả, đổi size, hỏi màu khác.',
          },
          {
            slug: '16-mua-online-doi-tra',
            title: 'Bài 16 — Mua online & đổi trả',
            summary: 'Đặt trên 淘宝, hỏi ship, đổi trả, đánh giá — từ vựng e-commerce Trung Quốc.',
          },
        ],
      },
      {
        title: 'Công việc & văn phòng',
        summary: 'Họp, email, gọi điện — tiếng Trung công sở.',
        lessons: [
          {
            slug: '07-tieng-trung-cong-so',
            title: 'Bài 7 — Tiếng Trung công sở',
            summary: 'Chào sếp, hẹn họp, viết một email ngắn, gọi điện công việc.',
          },
          {
            slug: '17-email-wechat-cong-so',
            title: 'Bài 17 — Email & WeChat công sở',
            summary: 'Cấu trúc email công sở, mở/đóng câu lịch sự, từ vựng chat WeChat công ty.',
          },
        ],
      },
      {
        title: 'Ngữ pháp trung cấp',
        summary: 'Thì quá khứ/tương lai, so sánh, ý kiến, điều kiện — bước ra khỏi câu sơ cấp.',
        lessons: [
          {
            slug: '08-thi-cua-dong-tu',
            title: 'Bài 8 — Thì của động từ (了, 过, 会, 要)',
            summary: 'Bốn dấu hiệu thì quan trọng nhất: hoàn thành 了, đã từng 过, sẽ 会/要.',
          },
          {
            slug: '09-so-sanh-y-kien',
            title: 'Bài 9 — So sánh & nói ý kiến',
            summary: '比, 更, 最 + 我觉得, 我认为 — diễn đạt quan điểm, so sánh hai thứ.',
          },
          {
            slug: '10-dieu-kien-ly-do',
            title: 'Bài 10 — Điều kiện & nguyên nhân',
            summary: '如果...就..., 因为...所以..., 虽然...但是... — câu phức cốt lõi.',
          },
        ],
      },
      {
        title: 'Hội thoại nâng cao',
        summary: 'Gọi điện thoại, than phiền, đàm phán — tình huống thực tế phức tạp hơn.',
        lessons: [
          {
            slug: '11-dien-thoai-than-phien',
            title: 'Bài 11 — Điện thoại & than phiền',
            summary: 'Gọi đặt chỗ, đổi đặt, than phiền dịch vụ, yêu cầu quản lý.',
          },
          {
            slug: '18-dam-phan-thuong-luong',
            title: 'Bài 18 — Đàm phán & thương lượng công việc',
            summary: 'Đề xuất, phản biện, đồng ý, từ chối — đàm phán giá, hợp đồng, deadline.',
          },
        ],
      },
      {
        title: 'Văn hoá & thành ngữ',
        summary: 'Thành ngữ (成语) thường gặp trong hội thoại đời thường và công sở.',
        lessons: [
          {
            slug: '12-thanh-ngu-pho-bien',
            title: 'Bài 12 — Thành ngữ thường gặp',
            summary: '马马虎虎, 一举两得, 入乡随俗 — 8 thành ngữ nghe hoài, hiểu là thấy ngay sự khác biệt.',
          },
          {
            slug: '19-le-tet-tang-qua',
            title: 'Bài 19 — Lễ Tết & tặng quà',
            summary: '春节, 中秋, 红包 — chúc Tết, quà tặng, kiêng kỵ văn hoá, "red envelope" văn hoá.',
          },
        ],
      },
    ],
  },
  {
    slug: 'cantonese',
    title: 'Cantonese',
    nativeName: '粵語',
    vietnameseName: 'Tiếng Quảng Đông',
    region: 'Hong Kong · Macau · Guangdong',
    summary:
      'Tiếng Hoa miền Nam — chủ yếu nói, ít chuẩn hoá viết. 6 thanh điệu, từ vựng và ngữ pháp khác Mandarin đáng kể. Văn hoá phim ảnh, ẩm thực Hồng Kông.',
    topics: [
      {
        title: 'Chào hỏi & giới thiệu',
        summary: '你好, 我叫… — mẫu câu mở đầu giao tiếp Cantonese.',
        lessons: [
          {
            slug: '01-chao-hoi-co-ban',
            title: 'Bài 1 — Chào hỏi cơ bản',
            summary: 'Năm câu chào kiểu Hồng Kông, đoạn hội thoại ngắn, và cách hỏi tên.',
          },
          {
            slug: '02-chao-hoi-thuc-thoi-hk',
            title: 'Bài 2 — Chào hỏi đời thường Hồng Kông',
            summary: '食咗飯未? — câu chào dùng "ăn cơm chưa", cách chào bạn bè, hàng xóm.',
          },
        ],
      },
      {
        title: 'Ăn uống Hồng Kông',
        summary: 'Dim sum, cha chaan teng, gọi món kiểu địa phương.',
        lessons: [
          {
            slug: '03-dim-sum-cha-chaan-teng',
            title: 'Bài 3 — Dim sum & cha chaan teng',
            summary: 'Gọi xíu mại, há cảo, trà sữa Hồng Kông; trả tiền theo phong cách HK.',
          },
          {
            slug: '13-bua-com-gia-dinh',
            title: 'Bài 13 — Bữa cơm gia đình & món địa phương',
            summary: 'Gọi món ở nhà hàng gia đình HK, ăn lẩu (打邊爐), tiệc đón Tết, văn hoá rót trà.',
          },
        ],
      },
      {
        title: 'Đi MTR & taxi',
        summary: 'Di chuyển trong Hồng Kông bằng tiếng Quảng.',
        lessons: [
          {
            slug: '04-mtr-taxi',
            title: 'Bài 4 — MTR, taxi & hỏi đường',
            summary: 'Đọc bảng MTR, đưa địa chỉ cho tài xế, hỏi quẹo trái quẹo phải.',
          },
          {
            slug: '14-san-bay-ferry-hk',
            title: 'Bài 14 — Sân bay HK & ferry sang Macau',
            summary: 'Check-in sân bay Chek Lap Kok, đi Airport Express, đặt vé ferry sang Macau.',
          },
        ],
      },
      {
        title: 'Mua sắm ở chợ',
        summary: 'Mong Kok, Causeway Bay — mặc cả và hỏi giá.',
        lessons: [
          {
            slug: '05-mong-kok-mac-ca',
            title: 'Bài 5 — Mua sắm Mong Kok & mặc cả',
            summary: '幾錢呀? 平啲得唔得? — hỏi giá kiểu HK, mặc cả, đổi size.',
          },
          {
            slug: '15-trung-tam-thuong-mai',
            title: 'Bài 15 — Mua sắm trung tâm thương mại HK',
            summary: 'IFC, Harbour City, ifc mall — hỏi nhân viên, dùng thẻ Octopus, đổi trả hàng cao cấp.',
          },
        ],
      },
      {
        title: 'Tiếng lóng phim Hồng Kông',
        summary: 'Từ vựng phổ biến trong phim TVB và phim hành động.',
        lessons: [
          {
            slug: '06-tu-tvb-pho-bien',
            title: 'Bài 6 — Tiếng lóng từ phim TVB',
            summary: '搞乜鬼? 唔好意思 — từ lóng nghe hoài trong phim Hồng Kông.',
          },
          {
            slug: '16-slang-internet-hk',
            title: 'Bài 16 — Slang Internet & mạng xã hội HK',
            summary: '巴打 (bro), 絲打 (sis), LM (Like Me) — slang LIHKG, Instagram, WhatsApp giới trẻ HK.',
          },
        ],
      },
      {
        title: 'Cuộc gặp công việc',
        summary: 'Gặp đối tác, trao danh thiếp, nói chuyện công việc.',
        lessons: [
          {
            slug: '07-gap-doi-tac-danh-thiep',
            title: 'Bài 7 — Gặp đối tác & trao danh thiếp',
            summary: 'Chào trang trọng, trao danh thiếp bằng hai tay, hẹn cuộc gặp tiếp theo.',
          },
          {
            slug: '17-hop-dong-deal-hk',
            title: 'Bài 17 — Hợp đồng & ký deal kiểu HK',
            summary: 'Bàn điều khoản, ký hợp đồng, mừng ký deal (簽合約), văn hoá ăn trưa business ở HK.',
          },
        ],
      },
      {
        title: 'Ngữ pháp trung cấp',
        summary: 'Thì với 咗/過/緊, so sánh, ý kiến, điều kiện — bước ra khỏi câu sơ cấp.',
        lessons: [
          {
            slug: '08-thi-cua-dong-tu',
            title: 'Bài 8 — Thì của động từ (咗, 過, 緊, 會)',
            summary: 'Bốn dấu hiệu thì: hoàn thành 咗, đã từng 過, đang 緊, sẽ 會.',
          },
          {
            slug: '09-so-sanh-y-kien',
            title: 'Bài 9 — So sánh & nói ý kiến',
            summary: '...啲 / 我覺得 / 我認為 — diễn đạt quan điểm và so sánh kiểu HK.',
          },
          {
            slug: '10-dieu-kien-ly-do',
            title: 'Bài 10 — Điều kiện & nguyên nhân',
            summary: '如果...就..., 因為...所以..., 雖然...但係... — câu phức trong giao tiếp HK.',
          },
        ],
      },
      {
        title: 'Hội thoại nâng cao',
        summary: 'Gọi điện, than phiền, xử lý tình huống khó — phía sau câu chào hỏi.',
        lessons: [
          {
            slug: '11-dien-thoai-than-phien',
            title: 'Bài 11 — Điện thoại & than phiền',
            summary: 'Gọi đặt chỗ, đổi đặt, than phiền dịch vụ, xin gặp quản lý.',
          },
          {
            slug: '18-dam-phan-cantonese',
            title: 'Bài 18 — Đàm phán & xử lý xung đột',
            summary: 'Đề xuất giá, từ chối lịch sự, thoả hiệp — đàm phán Cantonese kiểu HK business.',
          },
        ],
      },
      {
        title: 'Tiếng lóng & thành ngữ sâu',
        summary: 'Slang Hồng Kông + chengyu mượn từ Mandarin — nghe Cantonese đời thường hiểu hơn.',
        lessons: [
          {
            slug: '12-tieng-long-sau',
            title: 'Bài 12 — Tiếng lóng & thành ngữ sâu',
            summary: '搞掂, 一蚊都冇, 收皮 — slang HK nâng cao + vài chengyu thông dụng.',
          },
          {
            slug: '19-slang-than-mat',
            title: 'Bài 19 — Slang gia đình & bạn bè thân',
            summary: '老竇 (bố), 老母 (mẹ), 拍拖 (yêu nhau), 食蛋 (zero điểm) — slang gia đình HK + tiếng lóng đời thường.',
          },
        ],
      },
    ],
  },
];

export function getChineseLanguage(slug: string): ChineseLanguage | undefined {
  return CHINESE_LANGUAGES.find((lang) => lang.slug === slug);
}

export function getAllChineseLessons(): Array<{
  language: ChineseLanguage;
  topic: ChineseTopic;
  lesson: ChineseLessonMeta;
}> {
  const out: Array<{ language: ChineseLanguage; topic: ChineseTopic; lesson: ChineseLessonMeta }> = [];
  for (const language of CHINESE_LANGUAGES) {
    for (const topic of language.topics) {
      for (const lesson of topic.lessons) {
        out.push({ language, topic, lesson });
      }
    }
  }
  return out;
}

export function findChineseLesson(languageSlug: string, lessonSlug: string) {
  const language = getChineseLanguage(languageSlug);
  if (!language) return null;
  for (const topic of language.topics) {
    const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) return { language, topic, lesson };
  }
  return null;
}
