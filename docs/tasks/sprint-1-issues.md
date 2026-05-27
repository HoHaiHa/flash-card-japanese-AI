# Sprint 1 Issues Breakdown — STITCH-001

Tài liệu này chứa danh sách các GitHub Issues được phân rã cho tính năng **Học thẻ tiếng Nhật (3-sided Flashcard)**. Sẵn sàng để import hoặc copy paste thủ công lên GitHub.

---

## Issue 1: [STITCH-001] Cấu hình phiên học tập (Learning Configuration)

**Type**: Feature  
**Priority**: High  
**Estimate**: 3 story points  
**Sprint**: Sprint 1  
**Labels**: frontend, feature, STITCH-001  

### Mô tả

Xây dựng màn hình Cấu hình học tập cho phép người dùng tùy chỉnh các tham số trước khi bắt đầu học flashcard. Người dùng có thể chọn hướng dịch, loại nội dung học (từ vựng, mẫu câu, Hán tự) và bài học cụ thể để học.

### Liên kết tài liệu

- Spec: `docs/tasks/STITCH-001/requirements.md`
- Screen docs: `docs/screens/study/learning-config.md`
- User Story: `docs/tasks/STITCH-001/US-001.md`

### Acceptance Criteria

- [ ] **AC-001: Lựa chọn hướng dịch**  
  * **Given** Người dùng đang ở màn hình Cấu hình học tập  
  * **When** Người dùng click chọn dropdown "Hướng dịch"  
  * **Then** Hệ thống hiển thị 2 tùy chọn: "Nhật → Việt" và "Việt → Nhật"  
  * **And** Giá trị được cập nhật và lưu trữ tạm thời cho phiên học.
- [ ] **AC-002: Chọn nội dung học**  
  * **Given** Người dùng đang ở màn hình Cấu hình học tập  
  * **When** Người dùng chọn/bỏ chọn "Từ vựng", "Mẫu câu", hoặc "Hán tự"  
  * **Then** Trạng thái các checkbox thay đổi và hệ thống ghi nhận các nội dung sẽ học.
- [ ] **AC-003: Chọn bài học**  
  * **Given** Người dùng đang ở màn hình Cấu hình học tập  
  * **When** Người dùng tích chọn các bài học (ví dụ: Bài 1, Bài 2) trong vùng nét đứt  
  * **Then** Checkbox bài học chuyển sang màu xanh dương dạng checkmark tròn.
- [ ] **AC-004: Ràng buộc khi nhấn bắt đầu học**  
  * **Given** Người dùng đã hoàn thành thiết lập cấu hình  
  * **When** Người dùng nhấn nút "Bắt đầu học ngay"  
  * **Then** Nếu chưa chọn bất kỳ "Nội dung học" hoặc "Bài học" nào, hiển thị thông báo lỗi và không cho đi tiếp.  
  * **And** Nếu hợp lệ, hệ thống lưu thiết lập và chuyển hướng đến trang `/study/flashcard`.

### Technical Notes

- Giao diện thiết kế theo hệ màu **Seishun Learning**: Background (`#f8f9ff`), Dropdown (`bg-surface-container-low`), góc bo `rounded-lg` / `rounded-xl`.
- Sử dụng các biểu tượng (Material Symbol Icons) cho danh sách nội dung học: Từ vựng (`translate`), Mẫu câu (`menu`), Hán tự (`edit`).
- Quản lý form state cục bộ, thực hiện validate trước khi submit.

### Definition of Done

- [ ] Code complete và self-reviewed
- [ ] Giao diện khớp mockup và responsive trên mobile/desktop
- [ ] Unit tests pass cho logic validation form
- [ ] Không có lỗi blocker

---

## Issue 2: [STITCH-002] Quản lý và tra cứu danh sách học tập (Study List)

**Type**: Feature  
**Priority**: Medium  
**Estimate**: 5 story points  
**Sprint**: Sprint 1  
**Labels**: frontend, feature, STITCH-001  

### Mô tả

Xây dựng màn hình Danh sách học tập để hiển thị toàn bộ từ vựng, mẫu câu, Hán tự mà người dùng đang học. Màn hình hỗ trợ tìm kiếm realtime, lọc theo danh mục, đánh dấu yêu thích và thuộc lòng trực tiếp trên mỗi thẻ.

### Liên kết tài liệu

- Spec: `docs/tasks/STITCH-001/requirements.md`
- Screen docs: `docs/screens/study/study-list.md`
- User Story: `docs/tasks/STITCH-001/US-002.md`

### Acceptance Criteria

- [ ] **AC-001: Tìm kiếm từ vựng và ngữ pháp**  
  * **Given** Người dùng ở màn hình Danh sách học tập  
  * **When** Nhập từ khóa vào ô tìm kiếm  
  * **Then** Hệ thống tự động lọc realtime (debounce 300ms) trên các trường: Kanji, Furigana và nghĩa tiếng Việt.
- [ ] **AC-002: Chuyển đổi tab nội dung chính**  
  * **Given** Đang ở màn hình Danh sách học tập  
  * **When** Nhấn vào tab "Từ vựng", "Mẫu câu", hoặc "Hán tự"  
  * **Then** Tab được chọn có gạch chân xanh dương và danh sách thẻ thay đổi tương ứng.
- [ ] **AC-003: Lọc từ vựng theo trạng thái chưa thuộc**  
  * **Given** Đang ở màn hình Danh sách học tập  
  * **When** Bấm vào chip lọc "Chưa thuộc"  
  * **Then** Danh sách thẻ chỉ hiển thị các từ có trạng thái chưa thuộc lòng.
- [ ] **AC-004: Đánh dấu yêu thích nhanh**  
  * **Given** Danh sách từ vựng đang được hiển thị  
  * **When** Nhấn biểu tượng Ngôi sao (Star) trên thẻ từ vựng  
  * **Then** Trạng thái yêu thích được lưu tức thì, icon đổi màu vàng đất (nếu bật) hoặc rỗng viền xám (nếu tắt).
- [ ] **AC-005: Đánh dấu trạng thái đã thuộc nhanh**  
  * **Given** Danh sách từ vựng đang hiển thị  
  * **When** Nhấn biểu tượng Checkmark ở góc dưới bên phải thẻ  
  * **Then** Trạng thái chuyển đổi thuộc/chưa thuộc, icon chuyển màu xanh lá cây (đã thuộc) hoặc xanh dương nhạt (chưa thuộc).

### Technical Notes

- Thanh tìm kiếm sử dụng hiệu ứng focus (border màu Primary Blue kèm soft outer glow).
- Thẻ từ vựng được bo tròn `rounded-xl`, viền mảnh `border-outline-variant`, bóng đổ dịu nhẹ `shadow-sm`.
- Thực hiện debounce 300ms cho input tìm kiếm để tối ưu hiệu năng gọi API/lọc.
- Các hành động Toggle (Yêu thích/Đã thuộc) cần gọi API cập nhật trạng thái trực tiếp mà không cần tải lại toàn bộ trang.

### Definition of Done

- [ ] Code complete và self-reviewed
- [ ] Tính năng tìm kiếm và lọc hoạt động trơn tru, không lag
- [ ] Toggle trạng thái hoạt động chính xác và lưu xuống DB
- [ ] Unit tests pass cho logic lọc và debounce search
- [ ] Không có lỗi blocker

---

## Issue 3: [STITCH-003] Luyện tập từ vựng với thẻ Flashcard 3 mặt xoay 3D

**Type**: Feature  
**Priority**: High  
**Estimate**: 8 story points  
**Sprint**: Sprint 1  
**Labels**: frontend, feature, STITCH-001  

### Mô tả

Phát triển màn hình luyện tập chính sử dụng thẻ Flashcard 3 mặt xoay 3D. Hỗ trợ xoay lật tuần tự từ Kanji $\rightarrow$ Âm Hán/Bộ thủ $\rightarrow$ Nghĩa/Ví dụ. Cho phép đánh giá thuộc/chưa thuộc kèm hiệu ứng phản hồi thị giác và lọc nhanh phiên học.

### Liên kết tài liệu

- Spec: `docs/tasks/STITCH-001/requirements.md`
- Screen docs: `docs/screens/study/flashcard-study.md`
- User Story: `docs/tasks/STITCH-001/US-003.md`

### Acceptance Criteria

- [ ] **AC-001: Hiển thị tiến trình phiên học**  
  * **Given** Phiên học thẻ bắt đầu  
  * **When** Màn hình hiển thị  
  * **Then** Header hiển thị số lượng từ đã học (ví dụ: `12 / 20`) và thanh tiến độ cập nhật tỷ lệ tương ứng.
- [ ] **AC-002: Lật thẻ xoay 3 mặt tuần tự (3D rotation)**  
  * **Given** Người dùng đang xem thẻ  
  * **When** Người dùng click/chạm vào thẻ  
  * **Then** Thẻ thực hiện xoay 3D mượt mà góc 120 độ qua các mặt: Mặt 1 (Kanji) $\rightarrow$ Mặt 2 (Âm Hán/Bộ thủ) $\rightarrow$ Mặt 3 (Nghĩa/Ví dụ) $\rightarrow$ Mặt 1.
- [ ] **AC-003: Đánh giá thuộc và hiệu ứng chuyển thẻ**  
  * **Given** Người dùng đang xem thẻ  
  * **When** Click nút "Đã thuộc" hoặc "Chưa thuộc" ở dưới  
  * **Then** Lưu kết quả, chớp màu nền toàn trang trong 300ms (xanh lá cây cho Đã thuộc, đỏ cho Chưa thuộc) và chuyển sang từ tiếp theo với hiệu ứng pop-out.
- [ ] **AC-004: Tự động reset trạng thái thẻ mới**  
  * **Given** Người dùng vừa đánh giá thuộc/chưa thuộc  
  * **When** Thẻ từ mới xuất hiện  
  * **Then** Thẻ tự động quay về tư thế mặc định ban đầu (Mặt 1 - Chữ Kanji).
- [ ] **AC-005: Sử dụng phím tắt và các nút lọc nhanh**  
  * **Given** Phiên học đang diễn ra  
  * **When** Nhấn nút "Chưa thuộc", "Ngẫu nhiên" hoặc "Yêu thích" phía trên  
  * **Then** Hệ thống tiến hành lọc hoặc trộn ngẫu nhiên danh sách thẻ còn lại realtime.
- [ ] **AC-006: Kết thúc phiên học**  
  * **Given** Hoàn thành đánh giá từ cuối cùng  
  * **When** Thẻ cuối cùng biến mất  
  * **Then** Hiển thị màn hình chúc mừng (Congratulation) tổng kết kết quả học tập trong phiên.

### Technical Notes

- Triển khai hiệu ứng xoay 3D prism sử dụng các thuộc tính CSS nâng cao: `perspective: 1000px`, `transform-style: preserve-3d`, và class quay lật `rotateY(0deg)`, `rotateY(-120deg)`, `rotateY(-240deg)` với transition mượt mà (`cubic-bezier(0.4, 0, 0.2, 1)`).
- Tách biệt UI 3 mặt thẻ:
  * Mặt 1: Kanji to, Furigana nhỏ.
  * Mặt 2: Tiêu đề Âm Hán, danh sách các bộ thủ cấu thành dạng card nhỏ.
  * Mặt 3: Nghĩa chính to màu xanh, ví dụ tiếng Việt (nghiêng), ví dụ tiếng Nhật tương ứng.
- Đảm bảo thẻ mới khi tải vào luôn được gán góc xoay mặc định (`state-1`), tránh bị giữ nguyên góc xoay của thẻ cũ.
- Thực hiện hiệu ứng nháy màu nền body bằng cách thay đổi class hoặc inline style tạm thời với setTimeout 300ms.

### Definition of Done

- [ ] Hiệu ứng xoay 3D thẻ hoạt động mượt mà đạt ~60 FPS
- [ ] Chuyển đổi và reset thẻ hoạt động chính xác không bị lỗi hiển thị
- [ ] Unit tests pass cho bộ quản lý trạng thái phiên học và xáo trộn thẻ
- [ ] Đạt tiêu chuẩn responsive trên di động
- [ ] Không có lỗi blocker
