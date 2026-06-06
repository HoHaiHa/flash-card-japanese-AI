---
name: dev:scrape-lesson
description: >
  Cào dữ liệu từ vựng, chữ Hán, ngữ pháp của bài học Minna no Nihongo từ VNJPClub và lưu thành báo cáo Markdown trong docs/lessons/.
  Trigger khi: user nói "cào dữ liệu bài X", "lấy từ vựng bài X", "scrape bài X", hoặc gõ /dev:scrape-lesson.
---

# /dev:scrape-lesson
**Role**: Data Scraping Agent
**Mục đích**: Thu thập dữ liệu bài học Minna no Nihongo từ VNJPClub, làm sạch và bổ sung thông tin còn thiếu (bộ thủ chữ Hán, âm Hán Việt), rồi lưu thành file Markdown tại `docs/lessons/bai-X.md` để người dùng review trước khi import.

---

## Hướng dẫn thực hiện cho Agent

### Bước 1 — Xác định bài học cần cào

```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn muốn cào dữ liệu cho bài học nào?",
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

### Bước 2 — Kiểm tra báo cáo đã tồn tại chưa

Kiểm tra xem `docs/lessons/bai-X.md` đã tồn tại chưa.

- **Nếu đã tồn tại**: Hỏi người dùng có muốn cào lại (overwrite) hay cào thêm phần còn thiếu:

```javascript
default_api:ask_question({
  questions: [
    {
      question: "File docs/lessons/bai-X.md đã tồn tại. Bạn muốn làm gì?",
      options: [
        "Cào lại toàn bộ (ghi đè)",
        "Chỉ bổ sung phần còn thiếu/trống",
        "Hủy — xem lại file hiện tại trước"
      ],
      is_multi_select: false
    }
  ]
})
```

- **Nếu chưa tồn tại**: Tiến hành cào mới.

### Bước 3 — Mở trang Portal bài học trên VNJPClub

1. Dùng `chrome-devtools-mcp` (qua `new_page`) truy cập:
   `https://www.vnjpclub.com/minna-no-nihongo/bai-{X}.html`
2. Đọc nội dung trang để tìm các link chi tiết:
   - Link Từ vựng: thường có dạng `bai-{X}-tu-vung.html`
   - Link Ngữ pháp: thường có dạng `bai-{X}-ngu-phap.html`
   - Link Hán tự: thường có dạng `bai-{X}-han-tu.html` hoặc `luyen-chu-han-bai-{X}.html`
   - Link Hội thoại/Đọc hiểu nếu có

### Bước 4 — Thu thập dữ liệu chi tiết

#### 4.1 Thu thập Từ vựng

Truy cập trang từ vựng, phân tích từng mục:

| Trường | Mô tả | Quy tắc |
|--------|-------|---------|
| `kana` | Cách đọc Hiragana/Katakana | Bắt buộc |
| `kanji` | Chữ Hán của từ | Để trống nếu từ chỉ viết bằng kana (これ, パン...) |
| `sino_vietnamese` | Âm Hán Việt | Chỉ điền nếu có `kanji`. Không tự tìm kanji rồi điền HV |
| `definition` | Nghĩa tiếng Việt | Bắt buộc |
| `example_jp` | Câu ví dụ tiếng Nhật | Nếu có trên trang |
| `example_vi` | Dịch nghĩa câu ví dụ | Nếu có trên trang |

> **Quy tắc tuyệt đối**: Từ chỉ viết bằng Hiragana/Katakana → `kanji` và `sino_vietnamese` để trống. Không tự ý tra thêm.

#### 4.2 Thu thập Chữ Hán (Kanji)

Truy cập trang Hán tự, phân tích từng chữ:

| Trường | Mô tả |
|--------|-------|
| `kanji` | Bản thân chữ Hán (ví dụ: `勉`) |
| `kana` | Onyomi/Kunyomi |
| `sino_vietnamese` | Âm Hán Việt (ví dụ: `MIỄN`) |
| `definition` | Ý nghĩa của chữ |
| `details` | Onyomi, Kunyomi, từ ghép ví dụ |
| `components` | Bộ thủ cấu tạo kèm ý nghĩa (JSON array) |

Ví dụ `components`: `[{"char": "力", "meaning": "Bộ Lực (sức mạnh)"}, {"char": "免", "meaning": "Chữ Miễn"}]`

**Nếu VNJPClub thiếu bộ thủ**: Dùng `search_web` tìm trên Mazii, Jisho hoặc các trang học Hán tự để bổ sung.

#### 4.3 Thu thập Mẫu câu / Ngữ pháp

Truy cập trang ngữ pháp/hội thoại, trích xuất:

| Trường | Mô tả |
|--------|-------|
| `kanji` | Câu ví dụ viết đầy đủ (Kanji + Katakana) |
| `kana` | Phiên âm Hiragana của câu |
| `definition` | Dịch nghĩa tiếng Việt |
| `details` | Giải thích cấu trúc ngữ pháp |

### Bước 5 — Tạo báo cáo Markdown

Lưu toàn bộ dữ liệu vào `docs/lessons/bai-X.md` theo template sau:

```markdown
# Bài X — [Tên bài học]

**Nguồn**: https://www.vnjpclub.com/minna-no-nihongo/bai-X.html
**Ngày cào**: YYYY-MM-DD
**Trạng thái**: draft

---

## Từ vựng

| # | Kana | Kanji | Âm HV | Nghĩa VN | Ví dụ JP | Ví dụ VI |
|---|------|-------|--------|----------|----------|----------|
| 1 | ... | ... | ... | ... | ... | ... |

---

## Chữ Hán

| # | Chữ | Kana | Âm HV | Nghĩa | Chi tiết | Bộ thủ (JSON) |
|---|-----|------|--------|-------|----------|---------------|
| 1 | ... | ... | ... | ... | ... | ... |

---

## Mẫu câu / Ngữ pháp

| # | Câu (Kanji) | Phiên âm (Kana) | Nghĩa VN | Giải thích ngữ pháp |
|---|-------------|-----------------|----------|---------------------|
| 1 | ... | ... | ... | ... |

---

## Ghi chú

- [Ghi chú bất thường, dữ liệu thiếu, cần review thủ công...]
```

### Bước 6 — Báo cáo kết quả và chờ xác nhận

Sau khi lưu file, hiển thị tóm tắt:

```
✅ Đã lưu báo cáo tại: docs/lessons/bai-X.md

Thống kê:
- Từ vựng: N mục
- Chữ Hán: N mục  
- Mẫu câu: N mục
- Dữ liệu thiếu/cần review: [liệt kê nếu có]

Bước tiếp theo:
1. Mở docs/lessons/bai-X.md để review và chỉnh sửa nếu cần
2. Gọi lại /dev:scrape-lesson nếu muốn cào lại phần nào đó
3. Gọi /dev:import-lesson khi dữ liệu đã ổn để đẩy vào database
```

**Chờ confirm từ người dùng — không tự động import.**
