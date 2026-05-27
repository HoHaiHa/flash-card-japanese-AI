# Screen: Danh sách học tập

**Route/URL**: `/study/list`  
**Feature**: Vocabulary & Grammar List  
**Last updated**: 2026-05-24 16:00 JST  
**Updated by task**: STITCH-001  
**Commit**: `[short-sha]` — Initial setup of study list screen spec

---

## Mô tả

Màn hình hiển thị danh sách các từ vựng, mẫu câu, hoặc Hán tự đang học. Hỗ trợ tìm kiếm, lọc theo danh mục, đánh dấu yêu thích và cập nhật trạng thái thuộc/chưa thuộc trực tiếp trên từng thẻ. Dành cho người học theo dõi tiến độ học tập và ôn tập.

## Điều kiện truy cập

- **Role yêu cầu**: User
- **Authentication**: Required
- **Pre-condition**: Người dùng đăng nhập thành công.

## Layout & Components

### 1. Header
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Avatar/Icon | Image/Icon | No | Biểu tượng người dùng hoặc logo hình tròn màu xanh dương ở góc trên bên trái |
| Title | Label | Yes | Tiêu đề màn hình: "Danh sách học tập" |

### 2. Search Bar
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Ô tìm kiếm | Input Text | Yes | Placeholder: "Tìm kiếm từ vựng, ngữ pháp...". Có icon kính lúp tìm kiếm ở đầu |

### 3. Navigation Tabs (Phân loại chính)
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Từ vựng | Tab | Yes | Tab hiển thị danh sách từ vựng. Đang active có gạch chân màu xanh dương |
| Mẫu câu | Tab | Yes | Tab hiển thị danh sách các mẫu câu |
| Hán tự | Tab | Yes | Tab hiển thị danh sách các chữ Hán tự (Kanji) |

### 4. Filter Chips (Bộ lọc con)
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Tất cả | Chip | Yes | Hiện toàn bộ từ vựng (Active: nền xanh dương chữ trắng) |
| Chưa thuộc | Chip | Yes | Chỉ lọc các từ chưa thuộc (Inactive: nền xanh dương nhạt chữ xám) |

### 5. Vocabulary Cards (Danh sách thẻ từ)
Mỗi thẻ từ vựng hiển thị các thông tin:
- **Badge cấp độ**: Nằm ở góc trên bên trái (Ví dụ: `N5`, `N4`, `N3` với màu chữ xanh dương trên nền xanh dương nhạt).
- **Furigana**: Chữ Kana phiên âm đặt trong dấu ngoặc vuông `[ ]`.
- **Kanji/Từ vựng**: Chữ Kanji hoặc Hiragana chính hiển thị kích thước lớn, màu đen đậm.
- **Nghĩa tiếng Việt**: Phần giải nghĩa bên dưới chữ Kanji.
- **Nút Yêu thích (Star)**: Góc trên bên phải của thẻ. Icon ngôi sao viền xám (chưa yêu thích) hoặc ngôi sao tô đặc màu vàng đất (đã yêu thích).
- **Nút Trạng thái thuộc (Checkmark)**: Nút tròn góc dưới bên phải. Màu xanh dương nhạt có dấu check (chưa thuộc) hoặc màu xanh lá cây có dấu check đậm (đã thuộc).

## Business Rules (màn hình này)

| ID | Rule |
|----|------|
| BR-001 | Mặc định khi vào màn hình sẽ hiển thị tab **Từ vựng** và bộ lọc **Tất cả**. |
| BR-002 | Thanh tìm kiếm thực hiện tìm kiếm realtime (debounce 300ms) trên các trường: Chữ Kanji, Phiên âm Furigana, và Nghĩa tiếng Việt. |
| BR-003 | Bấm vào nút **Yêu thích (Star)** sẽ toggle trạng thái yêu thích của từ vựng đó và gọi API cập nhật ngay lập tức. |
| BR-004 | Bấm vào nút **Trạng thái thuộc (Checkmark)** sẽ toggle trạng thái thuộc/chưa thuộc: chuyển đổi màu sắc biểu tượng từ xanh dương nhạt (chưa thuộc) sang xanh lá cây (đã thuộc) và ngược lại, đồng thời cập nhật tiến độ học tập của người dùng. |
| BR-005 | Nhấp vào một thẻ bất kỳ sẽ mở modal chi tiết từ vựng hoặc chuyển hướng sang trang chi tiết của từ đó (nếu có). |

## User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Tìm kiếm | Nhập từ khóa vào ô tìm kiếm | Danh sách từ vựng tự động lọc theo từ khóa |
| Chuyển Tab | Bấm chọn tab "Mẫu câu" hoặc "Hán tự" | Thay đổi danh sách hiển thị tương ứng với loại nội dung chọn |
| Lọc theo trạng thái | Bấm chọn chip "Chưa thuộc" | Chỉ hiển thị các từ vựng chưa được đánh dấu thuộc |
| Toggle yêu thích | Click vào biểu tượng Ngôi sao (Star) | Thay đổi trạng thái yêu thích của từ (Lưu vào DB/LocalState) |
| Toggle trạng thái thuộc | Click vào biểu tượng Checkmark | Thay đổi trạng thái thuộc của từ (Lưu vào DB/LocalState) |

## Validation Messages

*Không có form validation trên màn hình này.*

## States

| State | Mô tả | Hiển thị |
|-------|-------|---------|
| Loading | Đang tải danh sách từ vựng từ API | Skeleton loading cho các thẻ từ |
| Empty | Không tìm thấy từ vựng nào khớp với từ khóa tìm kiếm hoặc bộ lọc | Hiển thị thông báo "Không tìm thấy từ vựng nào phù hợp" kèm hình ảnh minh họa |
| Error | Lỗi kết nối mạng khi gọi API tải danh sách | Hiển thị thông báo lỗi kèm nút "Thử lại" |

## API Calls

| Action | Method | Endpoint | Docs |
|--------|--------|----------|------|
| Tải danh sách học tập | GET | `/api/vocab` | `docs/api/vocab/list.md` |
| Toggle yêu thích | POST | `/api/vocab/favorite` | `docs/api/vocab/favorite.md` |
| Toggle trạng thái thuộc | POST | `/api/vocab/master` | `docs/api/vocab/master.md` |

## Ghi chú

- Phong cách thiết kế: Các thẻ từ có viền mảnh (`border-outline-variant`), bóng đổ dịu nhẹ (`shadow-sm` / `shadow-md`), bo góc tròn `rounded-xl` để tạo cảm giác hiện đại và sạch sẽ.
- Hỗ trợ cuộn vô hạn (infinite scroll) hoặc phân trang khi danh sách từ vựng quá lớn.
