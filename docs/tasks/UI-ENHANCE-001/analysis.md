# Analysis: UI-ENHANCE-001

## Risk Classification — UI-ENHANCE-001

**Input type**: maintenance / change-request
**Risk checklist**: R-02 ✅ (Task thay đổi data model ảnh hưởng existing records), R-09 ✅ (Task không có test coverage hiện tại cho area bị ảnh hưởng)
**Lane**: high-risk
**Lý do**: Thay đổi cấu trúc cơ sở dữ liệu trên Supabase (thêm các trường phân tích bộ thủ vào bảng vocabularies) và tùy biến CSS. Vì có thay đổi data model (R-02), risk level được xếp vào `high-risk`.

---

## Các Phương án Thiết kế

### 1. Dropdown hướng dịch
* **Phương án A: Sử dụng thẻ `<select>` mặc định của trình duyệt và viết CSS tùy biến.** (Chọn)
  * *Mô tả*: Viết CSS để tùy biến thẻ trigger select (border, padding, border-radius, background, custom arrow icon). Đối với dropdown options, dựa vào CSS native styling tốt nhất có thể của hệ điều hành.
  * *Ưu điểm*: Đơn giản, giữ nguyên logic native, không cần quản lý trạng thái mở/đóng bằng JS.
  * *Nhược điểm*: Trình duyệt (đặc biệt là Chrome, Safari) cực kỳ hạn chế việc style các thẻ `<option>` bên trong (không thể bo tròn các góc của hộp option sổ xuống, không thể chỉnh padding hay hover state đẹp mắt, không thể chèn icon checkmark).
* **Phương án B: Xây dựng Custom Select Component trong React.**
  * *Mô tả*: Ẩn select gốc, thay bằng một nút trigger và một thẻ `div` chứa danh sách option tự dựng. Quản lý trạng thái mở/đóng bằng React state (`isOpen`), đóng khi chọn hoặc click ra ngoài.
  * *Ưu điểm*: Tự do thiết kế 100%. Đạt chuẩn premium: bo góc mượt mà, bóng đổ dịu, hover background mượt, hiển thị icon checkmark cho option được chọn.
  * *Nhược điểm*: Cần thêm code quản lý click-outside và thêm style CSS.

### 2. Bộ lọc Yêu thích trong danh sách từ
* **Phương án duy nhất**: Bổ sung nút chip "Yêu thích" vào thanh `filter-chips` của `StudyList` và thêm điều kiện lọc vào hàm filter:
  ```javascript
  if (filterMode === 'favorite' && !item.favorite) return false;
  ```
  Cách này đồng bộ hoàn hảo với các chế độ lọc hiện tại của component.

### 3. Layout thẻ Kanji chính diện
* **Phương án duy nhất**: Sửa đổi CSS inline hoặc class trong `FlashcardStudy.jsx` để thay thế class `mb-stack-sm` (chưa được định nghĩa) thành CSS margin cụ thể (`marginBottom: '20px'`), đồng thời tăng kích thước font chữ Kanji chính lên `88px` để tạo độ tương phản mạnh mẽ (Visual Hierarchy).

### 4. Phân tích ý nghĩa bộ thủ và từ theo bộ thủ
* **Phương án A: Thêm cột vào bảng cơ sở dữ liệu trên Supabase.** (Chọn)
  * *Mô tả*: Thêm các trường `radical_analysis` và `character_logic` vào bảng `vocabularies`.
  * *Ưu điểm*: Dữ liệu được lưu trữ tập trung, dễ cập nhật thêm cho bất kỳ Kanji nào từ backend.
  * *Nhược điểm*: Phải viết migration script cập nhật cơ sở dữ liệu cloud, rủi ro lỗi kết nối hoặc ảnh hưởng code client đang chạy.
* **Phương án B: Thiết lập từ điển tra cứu Mnemonics tĩnh/động trên Frontend.**
  * *Mô tả*: Viết một helper function `getKanjiMnemonic(kanji, components, definition)` trong file React hoặc file utils chuyên biệt. Định nghĩa sẵn câu chuyện/phân tích ghi nhớ (Mnemonics) cho các Kanji mẫu hiện có (`勉`, `行`). Nếu gặp Kanji mới không có sẵn trong từ điển, tự động sinh phân tích động dựa trên tên bộ thủ và định nghĩa của chữ.
  * *Ưu điểm*: Thời gian phản hồi tức thì, không cần sửa đổi db schema, dễ dàng tạo câu chuyện tùy chọn sinh động cho các chữ mẫu. Có cơ chế fallback tự động.
  * *Nhược điểm*: Dữ liệu lưu trữ cục bộ trong client, nếu số lượng Kanji lên tới hàng ngàn từ sẽ làm phình gói javascript bundle.

---

## Phương án đã chọn và Lý do
- **Dropdown hướng dịch**: Phương án A (Native CSS) để đơn giản hóa giao diện, giữ độ ổn định cao và không phải xử lý Javascript click-outside.
- **Phân tích bộ thủ**: Phương án A (Database columns) để dữ liệu được lưu trữ chuẩn hóa ở cơ sở dữ liệu Supabase, phục vụ quản lý nội dung lâu dài.

## Kế hoạch triển khai database schema mới
1. Viết mã SQL thêm hai cột: `radical_analysis` (TEXT) và `character_logic` (TEXT) vào bảng `vocabularies`.
2. Tạo file `docs/tasks/UI-ENHANCE-001/schema.sql` chứa script migration.
3. Chạy script để cập nhật database Supabase thực tế.
4. Cập nhật các bản ghi mẫu:
   - Kanji `勉` (k1):
     - `radical_analysis` = 'Ghép từ bộ Lực (力 - sức mạnh) đứng cạnh chữ Miễn (免 - tránh né).'
     - `character_logic` = 'Để tránh né (免) thất bại và hướng tới thành công, con người cần phải dùng hết sức lực (力) để cố gắng, nỗ lực (勉).'
   - Kanji `行` (k2):
     - `radical_analysis` = 'Ghép từ bộ Xích (彳 - bước chân trái) và bộ Súc (亍 - bước chân phải).'
     - `character_logic` = 'Sự kết hợp của bước chân trái (彳) và bước chân phải (亍) tạo thành hành động đi lại, di chuyển (行).'
## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| [docs/tasks/UI-ENHANCE-001/schema.sql](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/UI-ENHANCE-001/schema.sql) | [NEW] | Bản ghi câu lệnh SQL migration để cập nhật bảng vocabularies và seed data mẫu. |
| [src/components/LearningConfig.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/LearningConfig.jsx) | [MODIFY] | Tùy biến class CSS cho select và dropdown wrapper. |
| [src/components/StudyList.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/StudyList.jsx) | [MODIFY] | Thêm chip lọc "Yêu thích" và cập nhật logic lọc danh sách. |
| [src/components/FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) | [MODIFY] | Fix layout chữ Hán tự, hiển thị phân tích bộ thủ và giải nghĩa chữ Hán lấy từ DB. |
| [src/App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css) | [MODIFY] | Cập nhật CSS cho custom dropdown, chip yêu thích và hiển thị phân tích bộ thủ. |

---

## Kế hoạch Kiểm thử (Verification Plan)

### Kiểm thử thủ công (Manual Verification)
1. **Dropdown hướng dịch**:
   - Mở màn hình cấu hình, click chọn Hướng dịch.
   - Kiểm tra xem dropdown có mở ra mượt mà, bo tròn các góc và đổ bóng mờ hay không.
   - Rà chuột (hover) qua các options xem có đổi màu nền nhẹ nhàng hay không.
   - Click chọn "Việt → Nhật", dropdown phải tự đóng và đổi giá trị hiển thị.
   - Click ra ngoài dropdown, dropdown phải tự động đóng.
2. **Bộ lọc yêu thích**:
   - Mở danh sách từ bài học.
   - Thử click Star (yêu thích) cho vài từ.
   - Click vào chip "Yêu thích". Danh sách chỉ được hiển thị các từ đã đánh dấu Star.
   - Đổi qua tab "Mẫu câu" hoặc "Hán tự", chip lọc yêu thích vẫn phải hoạt động chính xác.
3. **Layout Kanji & Bộ thủ**:
   - Bắt đầu học Kanji. Mặt trước của thẻ Kanji chính diện phải cách xa dòng On/Kun đọc bên dưới.
   - Lật sang mặt 3 của thẻ Kanji. Kiểm tra xem có hiển thị phân đoạn "Phân tích ý nghĩa bộ thủ" và "Ý nghĩa chữ Hán từ bộ thủ" với đầy đủ mô tả sinh động không.
