---
sessionId: SUPABASE-001-20260524-2212
createdAt: 2026-05-25 00:12 JST
updatedAt: 2026-05-25 00:12 JST
commitSha: ace97b3
roundCount: 1
lang: vi
---

# Tích hợp Supabase làm Cơ sở dữ liệu cho Dự án

**Task ID**: SUPABASE-001  
**Ngày tạo**: 2026-05-24  
**BA**: Antigravity  
**Trạng thái**: Approved  
**Lane**: normal  

---

## 1. Bối cảnh & Vấn đề

Ứng dụng Flashcard tiếng Nhật hiện đang sử dụng Mock database tĩnh (`VOCAB_DATABASE`) lưu trực tiếp trong mã nguồn frontend. Thiết kế này có hai vấn đề lớn:
1. Dữ liệu bài học và từ vựng/mẫu câu không thể mở rộng động mà phải sửa code.
2. Trạng thái học tập của người dùng (yêu thích, thuộc/chưa thuộc) chỉ lưu tạm ở bộ nhớ React State, sẽ biến mất hoàn toàn khi người dùng tải lại trang.

Cần tích hợp Supabase làm cơ sở dữ liệu đám mây để lưu trữ động dữ liệu học tập và đồng bộ trạng thái ghi nhớ của người dùng.

---

## 2. Mục tiêu

- Setup thư viện Supabase Client SDK trong dự án React/Vite.
- Thiết kế cơ sở dữ liệu trên Supabase gồm 3 bảng: bài học (`lessons`), từ vựng (`vocabularies`), và mẫu câu (`sentences`).
- Thay thế dữ liệu mock tĩnh bằng dữ liệu nạp động từ các bảng Supabase.
- Đồng bộ thao tác cập nhật trạng thái ghi nhớ và yêu thích của người học thời gian thực xuống database.

---

## 2b. Ràng buộc thiết kế & triển khai

| Loại | Ràng buộc | Lý do |
|------|-----------|-------|
| Kỹ thuật | Phải sử dụng Supabase Client SDK (`@supabase/supabase-js`) và PostgreSQL trên cloud. | Hạ tầng được yêu cầu cho dự án. |
| Bảo mật | Biến môi trường kết nối Supabase (URL, Anon Key) phải nạp qua file `.env` và KHÔNG được commit lên git. | Bảo vệ an toàn dữ liệu và tránh rò rỉ API Keys. |
| Nghiệp vụ | Trạng thái ghi nhớ và yêu thích lưu trực tiếp trên bảng dữ liệu gốc, không dùng cơ chế đăng nhập (Single-user). | Đơn giản hóa trải nghiệm người dùng theo yêu cầu nghiệp vụ. |

---

## 3. Phạm vi

### Trong phạm vi (In scope)
- Tạo các bảng `lessons`, `vocabularies`, `sentences` trên Supabase Dashboard.
- Cài đặt gói npm `@supabase/supabase-js` và cấu hình client kết nối.
- Sửa đổi các component `LearningConfig.jsx`, `StudyList.jsx`, `FlashcardStudy.jsx` để nạp dữ liệu động từ Supabase.
- Cập nhật trạng thái `favorite` và `status` (learned/forgot) lên database khi người dùng nhấn tương tác trên giao diện.

### Ngoài phạm vi (Out of scope)
- Tính năng đăng nhập/xác thực tài khoản (Supabase Auth).
- Giao diện Admin quản lý bài học (các thao tác quản lý dữ liệu gốc sẽ làm trực tiếp trên Supabase Dashboard).

---

## 4. Actors & Use Cases

| Actor | Use Case | Mô tả |
|-------|----------|-------|
| User (Người học) | Cấu hình học tập | Chọn bài học và loại nội dung lấy động từ Supabase. |
| User (Người học) | Xem danh sách từ | Xem danh sách từ vựng, mẫu câu thuộc bài học tương ứng trên Supabase. |
| User (Người học) | Học Flashcard & Đánh giá | Click lật thẻ 3D, đánh dấu yêu thích hoặc ghi nhớ và đồng bộ trạng thái trực tiếp xuống DB. |

---

## 5. Business Rules

| ID | Rule | Ghi chú |
|----|------|---------|
| BR-001 | Dữ liệu học tập và trạng thái (yêu thích, ghi nhớ) được dùng chung cho toàn bộ ứng dụng (Single-user / Shared), không phân biệt tài khoản cá nhân. | Người dùng không cần đăng nhập. |
| BR-002 | Trạng thái yêu thích (`favorite`) và ghi nhớ (`status`) được cập nhật trực tiếp trên bảng dữ liệu gốc `vocabularies` và `sentences`. | |
| BR-003 | Khi nhấn đánh giá "Đã thuộc" hoặc "Chưa thuộc" từ giao diện học, giá trị cột `status` trong database sẽ được cập nhật tương ứng thành `'learned'` hoặc `'forgot'`. | |
| BR-004 | Mỗi bài học (`lessons`) lưu trữ thông tin về tên bài học, JLPT level mặc định của bài học (ví dụ: N5, N4). | |

---

## 6. Luồng nghiệp vụ chính (Happy Path)

1. Ứng dụng khởi chạy, màn hình `LearningConfig` truy vấn danh sách các bài học từ bảng `lessons` của Supabase để hiển thị phần chọn bài học.
2. Người dùng cấu hình hướng dịch, loại nội dung và chọn bài học, sau đó click "Bắt đầu học ngay".
3. Ứng dụng truy vấn danh sách từ vựng từ `vocabularies` và mẫu câu từ `sentences` thuộc các bài học đã chọn từ Supabase.
4. Trong quá trình học, mỗi khi người dùng nhấn ngôi sao yêu thích hoặc nhấn nút "Đã thuộc"/"Chưa thuộc", một request cập nhật tương ứng được gửi xuống bảng `vocabularies` hoặc `sentences` trên Supabase để cập nhật trường `favorite` hoặc `status`.
5. Trạng thái hiển thị trên giao diện đồng bộ chính xác với cơ sở dữ liệu. Khi tải lại trang, các cài đặt trạng thái trước đó được khôi phục nguyên vẹn.

---

## 7. Luồng thay thế & Exception

| Trường hợp | Xử lý |
|-----------|-------|
| Mất kết nối Internet khi cập nhật trạng thái | Hiển thị thông báo lỗi mạng cho người dùng, giữ nguyên trạng thái local cho phiên học hiện tại để không gián đoạn trải nghiệm học. |

---

## 8. Acceptance Criteria

- [ ] AC-001: Khởi tạo database schema thành công trên Supabase với 3 bảng `lessons`, `vocabularies`, `sentences`.
- [ ] AC-002: Thiết lập kết nối client Supabase thông qua biến môi trường thành công, không hardcode API Keys trong code.
- [ ] AC-003: Danh sách bài học và từ vựng/mẫu câu trên giao diện được lấy động hoàn toàn từ Supabase.
- [ ] AC-004: Các thao tác yêu thích và đánh giá thuộc/chưa thuộc được ghi nhận thành công và đồng bộ thời gian thực xuống database.

---

## 9. Non-functional Requirements

| NFR-ID | Loại | Tiêu chí | Độ ưu tiên |
|--------|------|----------|------------|
| NFR-001 | Performance | Thời gian tải danh sách bài học và từ vựng từ API Supabase p95 < 500ms (ở mạng ổn định). | Must Have |
| NFR-002 | Security | Anon Keys và URL kết nối Supabase được quản lý qua biến môi trường `.env`. | Must Have |
| NFR-003 | Maintainability | Các logic giao tiếp DB được tách riêng thành helper functions để dễ kiểm thử và bảo trì. | Should Have |

---

## 10. User Stories

| ID | Tên | Priority | Estimate |
|----|-----|----------|----------|
| US-001 | Tích hợp Supabase Client SDK và Env Keys | High | 1h |
| US-002 | Thiết lập Database Schema & Dữ liệu mẫu trên Supabase | High | 1h |
| US-003 | Thay thế Mock Data trong các Component bằng API Supabase | High | 3h |

---

## 11. Câu hỏi mở (Open Questions)

Không có.

---

## 12. Harness Delta

- [x] Không có friction phát hiện trong task này

---

## 13. Q&A History

### Round 1 — 2026-05-25 00:10 JST

**Q1**: Cơ chế lưu trạng thái học tập (yêu thích, ghi nhớ) là theo cá nhân hay dùng chung?  
**Options**: Multi-user (Cần đăng nhập Supabase Auth) / Single-user (Dùng chung không cần đăng nhập)  
**Suggested**: Multi-user  
**Answer**: Single-user / Shared (Ứng dụng dùng chung một tập dữ liệu trạng thái, không cần đăng nhập)  
**Impact**: Ảnh hưởng phạm vi tích cực (Out of scope cho Auth), cập nhật BR-001.

**Q2**: Trạng thái yêu thích và ghi nhớ sẽ lưu ở đâu trong cơ sở dữ liệu?  
**Options**: Lưu ở bảng tiến độ riêng biệt (User Progress) / Lưu trực tiếp trên bảng dữ liệu gốc  
**Suggested**: Lưu ở bảng tiến độ riêng biệt  
**Answer**: Lưu trực tiếp trên bảng dữ liệu gốc (Vocabularies / Sentences)  
**Impact**: Đơn giản hóa cấu trúc schema, cập nhật BR-002.

**Q3**: Cấu trúc bảng Bài học (lessons) sẽ gồm những thông tin nào?  
**Options**: Đơn giản (Chỉ gồm ID và Tên bài) / Đầy đủ (Thêm JLPT level mặc định)  
**Suggested**: Đầy đủ  
**Answer**: Đầy đủ và thêm cấp độ N-level bài học thuộc về  
**Impact**: Cập nhật thiết kế bảng lessons, cập nhật BR-004.
