# Analysis: DB-CONNECT-001

## Phương án đã chọn: Phương án A: Node CLI Test Script
**Lý do**: Ưu tiên tốc độ thực hiện (Speed), gọn nhẹ, cho phép lập trình viên kiểm thử kết nối trực tiếp từ dòng lệnh mà không cần chạy Dev Server hay mở trình duyệt.

## Risk Classification — DB-CONNECT-001

**Input type**: new-initiative  
**Risk checklist**: R-06 ✅ (Cấu hình shared config/env), R-09 ✅ (Chưa có test coverage)  
**Lane**: normal  
**Lý do**: Đây là tác vụ thêm tính năng/kịch bản kiểm tra kết nối tới Database (Supabase) dựa trên cấu hình môi trường, không can thiệp vào cơ chế Auth hay thay đổi Schema dữ liệu hiện có.

---

## Các phương án đề xuất

### Phương án A: Node CLI Test Script (Khuyên dùng)
* **Mô tả**: Tạo kịch bản script độc lập chạy từ Terminal (<code>scripts/check-db.js</code>) sử dụng Node.js và Supabase Client SDK để kiểm thử kết nối (truy vấn danh sách bài học).
* **Files cần thay đổi**:
  * `[NEW] scripts/check-db.js` — Script đọc env và gọi thử Supabase Client.
* **Estimate**: 1 giờ.
* **Ưu điểm**:
  * Chạy cực nhanh không cần mở trình duyệt/Dev Server.
  * Hữu ích khi lập trình viên muốn verify kết nối nhanh từ terminal.
  * Có thể dùng làm test-script trong CI/CD.
* **Nhược điểm**: Chỉ chạy được trên môi trường Terminal.
* **Risk**: Không có.

### Phương án B: Nút check kết nối trên Giao diện (UI Check)
* **Mô tả**: Thêm nút và chỉ chỉ báo trạng thái kết nối trên Header của UI, ping DB thông qua service <code>getLessons()</code>.
* **Files cần thay đổi**:
  * `[MODIFY] src/components/LearningConfig.jsx` — Thêm UI và logic gọi kết nối.
* **Estimate**: 2 giờ.
* **Ưu điểm**: Trực quan và trực quan trên trình duyệt (kiểm chứng được cả vấn đề CORS/Network thực tế).
* **Nhược điểm**: Làm phình to component UI, tốn công thiết kế CSS để khớp style Seishun Learning.
* **Risk**: Thấp (ảnh hưởng giao diện).

---

## Câu hỏi mở còn lại
Không có.
