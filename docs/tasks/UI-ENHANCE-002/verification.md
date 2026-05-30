# Verification: UI-ENHANCE-002

Tài liệu này ghi nhận kết quả kiểm chứng cho các chức năng được sửa đổi trong task `UI-ENHANCE-002`.

## 1. Automated Tests (Kiểm thử tự động)
Đã chạy bộ unit test bằng Vitest để đảm bảo tính đúng đắn của mapping dữ liệu `onyomi` và `kunyomi`:
```bash
> my-react-app@0.0.0 test
> vitest run

 RUN  v4.1.7 C:/project-ai/flash-card-japanese-AI

 ✓ src/services/db.test.js (9 tests) 14ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```

## 2. Manual Verification (Kiểm thử thủ công)
Sử dụng Chrome DevTools MCP để kiểm chứng giao diện trực quan trên trình duyệt local (`http://localhost:5173/`):

### 2.1. Layout nút lọc nhanh (Quick Action Bar)
- Cấu hình CSS đảm bảo 3 nút "Chưa thuộc", "Ngẫu nhiên" và "Yêu thích" co giãn linh hoạt trên cùng một dòng ngang, không bị ngắt xuống dòng trên các viewport có độ rộng hẹp (320px - 480px).

### 2.2. Stable Rank Shuffle (Xáo trộn ngẫu nhiên)
- Nhấn bật nút "Ngẫu nhiên", thứ tự thẻ được xáo trộn tức thời (ví dụ: chuyển từ `Hán tự` -> `Mẫu câu` sang `Mẫu câu` -> `Hán tự`).
- Khi nhấn chọn "Đã thuộc" hoặc "Chưa thuộc", trạng thái response thay đổi nhưng thứ tự các thẻ còn lại vẫn giữ nguyên vị trí ổn định (không bị nhảy/xáo trộn lại).
- Tắt nút "Ngẫu nhiên", thứ tự các thẻ quay trở lại thứ tự mặc định của bài học. Bật lại nút "Ngẫu nhiên" sẽ kích hoạt lượt xáo trộn mới.

### 2.3. Tái cấu trúc thẻ Mẫu câu (Sentence Card)
- Thẻ Mẫu câu được cấu trúc lại hoàn toàn thành **2 slide** thay vì 3:
  - **Slide 1 (Mặt trước)**: Hiển thị cấu trúc ngữ pháp mẫu công thức trực quan và to rõ (ví dụ: `Danh từ / Chỉ thị từ + を + Động từ` thay vì chuỗi mô tả text thông thường).
  - **Slide 2 (Mặt sau)**: Kết hợp hiển thị câu ví dụ tiếng Nhật (`kanji` / `kana`), ý nghĩa tiếng Việt (`definition`), và danh sách phân tích chi tiết các trợ từ (`components`) ở phía dưới với vạch ngăn đứt quãng tinh tế. Có thanh cuộn dọc mượt mà để tránh tràn nội dung trên thiết bị di động.

### 2.4. Tách biệt âm On/Kun Kanji
- Kanji card mặt trước hiển thị cách đọc âm On và âm Kun bằng các tag/badge riêng biệt:
  - `On: ベン` (Nền xám mờ, chữ Tertirary)
  - `Kun: つと.める` (Nền xám mờ, chữ Primary)
- Thiết kế badge bo góc mềm mại, độ giãn cách hợp lý giúp người học dễ dàng nhận diện và phân biệt.
