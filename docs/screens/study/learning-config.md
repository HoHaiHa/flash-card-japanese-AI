# Screen: Cấu hình học tập

**Route/URL**: `/study/config`  
**Feature**: Study Configuration  
**Last updated**: 2026-05-30 09:45 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Update screen flow specifications for learning config and flashcards

---

## Mô tả

Màn hình cho phép người dùng cấu hình các thiết lập học tập trước khi bắt đầu học flashcard, bao gồm chọn hướng dịch, nội dung học (từ vựng, mẫu câu, Hán tự) và chọn các bài học (bài 1, bài 2, v.v.). Dành cho đối tượng người học tiếng Nhật.

## Điều kiện truy cập

- **Role yêu cầu**: User
- **Authentication**: Required
- **Pre-condition**: Người dùng đã đăng nhập và nhấn vào nút "Bắt đầu học" hoặc biểu tượng cấu hình học tập từ màn hình chính.

## Layout & Components

### 1. Header
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Title | Label | Yes | Hiển thị tiêu đề màn hình: "Cấu hình học tập" |

### 2. Main Config Card (Thẻ cấu hình chính)
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Hướng dịch | Dropdown | Yes | Selector chọn hướng dịch, mặc định hiển thị "Nhật → Việt" |
| Nội dung học | Checkbox List | Yes | Danh sách nội dung gồm: "Từ vựng" (checked), "Mẫu câu" (checked), "Hán tự" (unchecked). Kèm icon minh họa ở đầu |
| Chọn bài học | Checkbox List | Yes | Nằm trong khung viền đứt nét (dashed border), hiển thị danh sách bài học: "Bài 1" (checked), "Bài 2" (checked). Biểu tượng checkmark dạng hình tròn |

### 3. Bottom Actions
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Bắt đầu học ngay | Button | Yes | Nút bấm chính màu xanh dương, bo góc, có bóng đổ tactile, chứa text "Bắt đầu học ngay" và icon Play ở cuối |

## Business Rules (màn hình này)

| ID | Rule |
|----|------|
| BR-001 | Hướng dịch có các tùy chọn: "Nhật → Việt" (mặc định) và "Việt → Nhật". |
| BR-002 | Việc chọn loại nội dung học (Từ vựng, Mẫu câu, Hán tự) sẽ quyết định loại flashcard nào xuất hiện trong phiên học. Mỗi mục là một loại thẻ học riêng biệt. Ít nhất một "Nội dung học" phải được chọn. |
| BR-003 | Mỗi bài học hiển thị dưới dạng một ô hình chữ nhật kèm theo một checkbox hình tròn ở bên phải. Khi người dùng click vào vùng chữ nhật của bài học, ứng dụng sẽ chuyển hướng sang màn hình Danh sách học tập của bài đó. Khi click vào checkbox tròn, bài học đó sẽ được chọn hoặc bỏ chọn để đưa vào danh sách học flashcard. |
| BR-004 | Khi nhấn "Bắt đầu học ngay", hệ thống sẽ lưu cấu hình học tập hiện tại vào LocalStorage và chuyển hướng sang màn hình học flashcard tương ứng với các cấu hình đã chọn. |

## User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Chọn hướng dịch | Thay đổi giá trị ở dropdown "Hướng dịch" | Cập nhật hướng dịch được chọn |
| Chọn nội dung học | Tích chọn/bỏ chọn checkbox "Từ vựng", "Mẫu câu", hoặc "Hán tự" | Cập nhật danh sách nội dung học (từ vựng, mẫu câu, hán tự là các loại flashcard riêng biệt) |
| Tích chọn bài học | Click vào checkbox hình tròn của bài học trong danh sách | Thêm hoặc loại bỏ bài học đó khỏi danh sách học Flashcard |
| Xem danh sách từ bài học | Click vào vùng hình chữ nhật của bài học | Chuyển hướng đến màn hình danh sách học tập (`/study/list`) của bài học đó |
| Bắt đầu học | Click nút "Bắt đầu học ngay" | Lưu cấu hình vào LocalStorage và chuyển hướng đến `/study/flashcard` |

## Validation Messages

| Field | Condition | Message |
|-------|-----------|---------|
| Nội dung học | Không chọn nội dung nào | "Vui lòng chọn ít nhất một nội dung học" |
| Chọn bài học | Không chọn bài học nào | "Vui lòng chọn ít nhất một bài học để tiếp tục" |

## States

| State | Mô tả | Hiển thị |
|-------|-------|---------|
| Loading | Đang tải dữ liệu cấu hình ban đầu hoặc danh sách bài học từ API | Skeleton/Spinner |
| Error | Không thể tải danh sách bài học hoặc lưu cấu hình | Hiển thị toast message "Lỗi kết nối, vui lòng thử lại" |
| Success | Cấu hình hợp lệ và nhấn bắt đầu học | Chuyển hướng sang màn hình học |

## API Calls

| Action | Method | Endpoint | Docs |
|--------|--------|----------|------|
| Tải danh sách bài học | GET | `/api/lessons` | `docs/api/lessons/list.md` |
| Tải cấu hình mặc định | GET | `/api/user/study-settings` | `docs/api/user/settings.md` |
| Lưu cấu hình học tập | POST | `/api/user/study-settings` | `docs/api/user/settings.md` |

## Ghi chú

- Giao diện thiết kế theo hệ màu **Seishun Learning**: Primary Blue (`#0040e0` / `#2e5bff`), Background (`#f8f9ff`), Surface Card (`#ffffff`), các góc bo mềm mại (`rounded-lg` / `rounded-xl`).
- Dropdown hướng dịch sử dụng bộ chọn tối giản của hệ thống hoặc custom dropdown đồng bộ màu sắc.
