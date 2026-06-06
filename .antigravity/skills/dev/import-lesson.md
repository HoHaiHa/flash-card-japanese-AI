---
name: dev:import-lesson
description: >
  Đọc báo cáo Markdown đã được review từ docs/lessons/ và import dữ liệu vào Supabase database.
  Trigger khi: user nói "import bài X vào DB", "đẩy dữ liệu bài X", "import lesson", hoặc gõ /dev:import-lesson.
---

# /dev:import-lesson
**Role**: Database Import Agent
**Mục đích**: Đọc file báo cáo Markdown đã được review tại `docs/lessons/bai-X.md`, chuyển đổi sang JSON, rồi đồng bộ vào Supabase thông qua `scripts/import-to-db.js`.

> **Điều kiện tiên quyết**: File `docs/lessons/bai-X.md` phải tồn tại và đã được review (do `/dev:scrape-lesson` tạo ra). Nếu chưa có, hãy chạy `/dev:scrape-lesson` trước.

---

## Hướng dẫn thực hiện cho Agent

### Bước 1 — Xác định bài học cần import

```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn muốn import dữ liệu của bài học nào vào database?",
      options: [
        "Bài 1",
        "Bài 2",
        "Bài khác (vui lòng điền vào ô ghi chú)"
      ],
      is_multi_select: false
    }
  ]
})
```

*Nếu người dùng chọn "Bài khác", lấy số bài (X) từ câu trả lời tự viết.*

### Bước 2 — Kiểm tra file báo cáo

1. Kiểm tra `docs/lessons/bai-X.md` có tồn tại không.
   - **Không tồn tại** → Dừng lại, thông báo: *"Chưa có báo cáo cho bài X. Hãy chạy /dev:scrape-lesson trước."*
   - **Tồn tại** → Tiếp tục.

2. Đọc nội dung file và xác nhận với người dùng trước khi import:

```
📄 Đã tìm thấy: docs/lessons/bai-X.md

Thống kê dữ liệu sẽ import:
- Từ vựng: N mục
- Chữ Hán: N mục
- Mẫu câu: N mục

Bạn có muốn tiếp tục import vào database không?
```

```javascript
default_api:ask_question({
  questions: [
    {
      question: "Xác nhận import dữ liệu bài X vào Supabase?",
      options: [
        "Xác nhận — tiến hành import",
        "Hủy — cần xem lại dữ liệu"
      ],
      is_multi_select: false
    }
  ]
})
```

**Chờ confirm trước khi thực thi.**

### Bước 3 — Chuyển đổi Markdown sang JSON

Phân tích nội dung `docs/lessons/bai-X.md` và xây dựng cấu trúc JSON:

```json
{
  "lesson": X,
  "vocab": [
    {
      "kana": "...",
      "kanji": "...",
      "sino_vietnamese": "...",
      "definition": "...",
      "example_jp": "...",
      "example_vi": "..."
    }
  ],
  "kanji": [
    {
      "kanji": "...",
      "kana": "...",
      "sino_vietnamese": "...",
      "definition": "...",
      "details": "...",
      "components": [{"char": "...", "meaning": "..."}]
    }
  ],
  "sentences": [
    {
      "kanji": "...",
      "kana": "...",
      "definition": "...",
      "details": "..."
    }
  ]
}
```

Lưu vào `scripts/temp-lesson-data.json`.

### Bước 4 — Thực thi script import

Chạy lệnh:

```bash
node scripts/import-to-db.js
```

Theo dõi output để phát hiện lỗi. Nếu gặp lỗi:
- Báo cáo chi tiết lỗi cho người dùng.
- Gợi ý cách sửa (ví dụ: trường bị null, định dạng JSON sai...).
- **Không tự động retry** — chờ người dùng quyết định.

### Bước 5 — Xác nhận và dọn dẹp

1. Chạy `node scripts/check-db.js` (nếu script tồn tại) để xác nhận dữ liệu đã lưu thành công.
2. Xóa file tạm `scripts/temp-lesson-data.json`.
3. Cập nhật trạng thái trong `docs/lessons/bai-X.md`: đổi `**Trạng thái**: draft` thành `**Trạng thái**: imported`.
4. Báo cáo kết quả:

```
✅ Import thành công bài X vào Supabase!

Đã import:
- Từ vựng: N bản ghi
- Chữ Hán: N bản ghi
- Mẫu câu: N bản ghi

File docs/lessons/bai-X.md đã được cập nhật trạng thái → imported.
```
