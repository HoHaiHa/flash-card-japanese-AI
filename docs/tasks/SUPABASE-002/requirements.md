---
sessionId: SUPABASE-002-20260530-0905
createdAt: 2026-05-30 09:05 JST
updatedAt: 2026-05-30 09:05 JST
commitSha: draft
roundCount: 0
lang: vi
---

# Tích hợp API xử lý với giao diện (UI)

**Task ID**: SUPABASE-002  
**Ngày tạo**: 2026-05-30  
**BA**: Antigravity  
**Trạng thái**: Draft  
**Lane**: normal  

---

## 1. Bối cảnh & Vấn đề

Ứng dụng Flashcard tiếng Nhật đã tích hợp Supabase để truy vấn dữ liệu học tập cơ bản (bài học, từ vựng, mẫu câu) và cập nhật trạng thái thuộc bài/yêu thích trực tiếp. Tuy nhiên, vẫn còn hai mảnh ghép thiếu:
1. **Lưu cấu hình học tập**: Lựa chọn hướng dịch, loại nội dung và bài học của người dùng chưa được lưu lại. Mỗi lần tải lại trang, người học phải chọn lại từ đầu.
2. **Lưu lịch sử học tập**: Chưa có cơ chế ghi nhận kết quả hoàn thành phiên học (ngày giờ học, số từ đã thuộc/chưa thuộc) để theo dõi tiến độ dài hạn.
3. **Thiếu tài liệu thiết kế API**: Chưa có tài liệu đặc tả baseline API (`docs/api/`) gây khó khăn cho việc đối chiếu và phát triển sau này.

Cần triển khai các API xử lý này (dưới dạng các hàm trong `src/services/db.js` tương ứng với API logic) và liên kết hoàn thiện với UI.

---

## 2. Mục tiêu

- Thiết kế và viết tài liệu baseline API đặc tả cho toàn bộ các giao tiếp dữ liệu của hệ thống.
- Bổ sung tính năng lưu và tự động khôi phục cấu hình học tập (User Settings).
- Thiết lập bảng lưu lịch sử phiên học (`study_sessions`) trên Supabase, viết hàm lưu kết quả học tập khi hoàn thành phiên.
- Tích hợp các API này với giao diện React hiện tại.
- Đảm bảo độ tin cậy của tầng dịch vụ dữ liệu bằng cách viết Unit Tests cho `db.js`.

---

## 2b. Ràng buộc thiết kế & triển khai

| Loại | Ràng buộc | Lý do |
|------|-----------|-------|
| Kỹ thuật | Phải tuân thủ kiến trúc Serverless hiện tại, gọi trực tiếp từ client (React/db.js) tới Supabase hoặc sử dụng LocalStorage. | Tránh tạo backend trung gian cồng kềnh không cần thiết. |
| Cơ sở dữ liệu | Cấu trúc bảng lịch sử học tập phải đồng bộ khóa ngoại với bảng `lessons` nếu cần thiết hoặc lưu trữ độc lập. | Đảm bảo tính toàn vẹn dữ liệu. |
| Tương thích | RLS Policy của bảng mới phải mở tương tự các bảng trước (`USING (true)`) để phù hợp với Single-user/Shared mode. | Đồng bộ với chính sách bảo mật hiện tại của hệ thống. |

---

## 3. Phạm vi

### Trong phạm vi (In scope)
- Viết tài liệu baseline API spec vào thư mục `docs/api/`.
- Viết các hàm `getStudySettings()`, `saveStudySettings()` để lưu trữ cấu hình.
- Tạo bảng `study_sessions` trên Supabase qua SQL.
- Viết hàm `saveSessionResult(sessionData)` trong `db.js`.
- Kết nối các hàm này vào UI của các component `LearningConfig.jsx` và `FlashcardStudy.jsx`.
- Viết Unit Test cho `db.js`.

### Ngoài phạm vi (Out of scope)
- Tính năng đăng nhập (Auth).
- Giao diện biểu đồ thống kê (sẽ làm ở task sau).

---

## 4. Actors & Use Cases

| Actor | Use Case | Mô tả |
|-------|----------|-------|
| User (Người học) | Lưu & khôi phục cấu hình | Cấu hình học tập tự động giữ nguyên khi mở lại ứng dụng. |
| User (Người học) | Lưu lịch sử phiên học | Hệ thống ghi nhận kết quả học tập tự động mỗi khi hoàn thành phiên. |

---

## 5. Business Rules

| ID | Rule | Ghi chú |
|----|------|---------|
| BR-001 | Cấu hình học tập gần nhất của người dùng sẽ được lưu trữ cục bộ. | Cho phép trải nghiệm nhanh mà không cần tạo bảng settings cá nhân phức tạp trên DB. |
| BR-002 | Mỗi khi người dùng hoàn thành toàn bộ các thẻ trong phiên học và chuyển sang màn hình chúc mừng (Congratulation), hệ thống phải tự động gửi thông tin phiên học xuống DB. | Lưu trữ số lượng từ đã thuộc, chưa thuộc, thời gian học. |

---

## 6. Luồng nghiệp vụ chính (Happy Path)

### Lưu cấu hình học tập
1. Người dùng chọn hướng dịch, nội dung và các bài học trên màn hình cấu hình học tập.
2. Khi bấm "Bắt đầu học ngay", hệ thống lưu cấu hình này vào LocalStorage.
3. Khi người dùng quay lại màn hình cấu hình hoặc reload trang, hệ thống tự động tải cấu hình cũ và hiển thị lên UI.

### Lưu kết quả phiên học
1. Người dùng học đến thẻ cuối cùng, bấm "Đã thuộc" hoặc "Chưa thuộc".
2. Màn hình chúc mừng hiện lên hiển thị số từ đã thuộc/chưa thuộc.
3. Hệ thống gửi yêu cầu API lưu kết quả phiên học gồm: `learned_count`, `forgot_count`, `total_cards` và `created_at` xuống bảng `study_sessions` trên Supabase.

---

## 7. Luồng thay thế & Exception

| Trường hợp | Xử lý |
|-----------|-------|
| Không thể kết nối DB khi lưu kết quả phiên | Ghi log lỗi, hiển thị thông báo nhẹ (toast/cảnh báo) và cho phép người học bấm nút "Làm phiên học mới" để không chặn trải nghiệm. |

---

## 8. Acceptance Criteria

- [ ] AC-001: Tạo đầy đủ các tài liệu baseline API trong thư mục `docs/api/`.
- [ ] AC-002: Tích hợp thành công lưu cấu hình học tập, khi reload trang cấu hình đã chọn vẫn giữ nguyên.
- [ ] AC-003: Tạo bảng `study_sessions` thành công trên Supabase với các trường cần thiết và thiết lập RLS.
- [ ] AC-004: Lưu kết quả học thành công khi hoàn thành phiên flashcard, dữ liệu hiển thị đúng trên Supabase Dashboard.
- [ ] AC-005: Viết Unit Test phủ tối thiểu 80% logic file `src/services/db.js`.

---

## 9. Non-functional Requirements

| NFR-ID | Loại | Tiêu chí | Độ ưu tiên |
|--------|------|----------|------------|
| NFR-001 | Performance | Hàm lưu cấu hình và khôi phục hoạt động < 50ms. | Must Have |
| NFR-002 | Maintainability | Viết Unit Test cho file `db.js` với coverage >= 80%. | Should Have |

---

## 10. User Stories

| ID | Tên | Priority | Estimate |
|----|-----|----------|----------|
| US-001 | Viết tài liệu đặc tả API specs | High | 2h |
| US-002 | Lưu và tải cấu hình học tập (Settings API) | High | 2h |
| US-003 | Lưu lịch sử phiên học tập (Session History API) | High | 3h |
| US-004 | Viết Unit Test cho db.js | Medium | 3h |

---

## 11. Câu hỏi mở (Open Questions)

| ID | Câu hỏi | Người trả lời | Deadline | Status |
|----|---------|---------------|----------|--------|
| Q-001 | Kết quả học tập có lưu thông tin chi tiết bài học nào không hay chỉ lưu tổng số lượng? | User | Trước /dev:implement | Open |

---

## 12. Harness Delta

- [x] Không có friction phát hiện trong task này

---

## 13. Q&A History

Không có.
