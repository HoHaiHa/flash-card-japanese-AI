# Technical Analysis: Vertical Prism 3D Flip (PRISM-001)

## 1. Yêu cầu & Mục tiêu
Thay đổi hiệu ứng lật của thẻ Flashcard từ lật ngang (xoay quanh trục Y) sang xoay dọc kiểu khối lăng trụ đứng (xoay quanh trục X, lật lên/xuống). Người dùng muốn hiệu ứng lật trông tự nhiên và có chiều sâu 3D rõ rệt.

## 2. Các file ảnh hưởng
- [App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css): Cần sửa đổi các class transform xoay 3D từ `rotateY` sang `rotateX` và điều chỉnh khoảng cách `translateZ`.
- [FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx): Cần cập nhật cấu trúc class trạng thái để kích hoạt hiệu ứng xoay.

---

## 3. Đề xuất phương án kỹ thuật

### Phương án 1: Xoay dọc phẳng (Flat Vertical Flip)
Thay đổi trục xoay từ Y sang X nhưng vẫn giữ khoảng cách `translateZ(1px)`. Thẻ sẽ chỉ lật lên/xuống tại chỗ.

* **Ưu điểm**:
  - Code đơn giản, không cần tính toán chiều cao của thẻ.
  - Giao diện ổn định, không lo nội dung bị dịch chuyển ra ngoài khung khi xoay.
* **Nhược điểm**:
  - Không tạo cảm giác một khối lăng trụ đứng thực sự (thiếu chiều sâu 3D khi chuyển mặt).

### Phương án 2 (Khuyến nghị): Khối lăng trụ đứng 3D thực tế (True 3D Volumetric Vertical Prism)
Sử dụng toán học để dịch chuyển các mặt thẻ ra xa tâm một khoảng bằng bán kính đường tròn nội tiếp của tam giác đều cấu thành lăng trụ đứng.
Với chiều cao thẻ là $H$, khoảng cách dịch chuyển dọc trục Z (translateZ) sẽ là:
$$translateZ = \frac{H}{2 \sqrt{3}} \approx 0.288 \times H$$

* **Cài đặt CSS**:
  - Thêm CSS variable `--card-height` để lưu trữ chiều cao của thẻ (hoặc tính toán động).
  - Cấu hình mặt thẻ:
    - Mặt 1: `transform: rotateX(0deg) translateZ(var(--card-depth))`
    - Mặt 2: `transform: rotateX(120deg) translateZ(var(--card-depth))`
    - Mặt 3: `transform: rotateX(240deg) translateZ(var(--card-depth))`
  - Khi xoay, container xoay quanh trục X: `rotateX(0deg)`, `rotateX(-120deg)`, `rotateX(-240deg)`.
* **Ưu điểm**:
  - Tạo ra hiệu ứng 3D khối lăng trụ đứng cực kỳ chân thực và đẹp mắt (nhìn rõ các cạnh xoay trong không gian 3D).
  - Tối ưu hóa trải nghiệm thị giác ("wow" factor).
* **Nhược điểm**:
  - Cần tính toán động chiều cao của card hoặc gán cố định tỉ lệ Aspect Ratio để CSS tính toán chính xác.

---

## 4. Kế hoạch triển khai (Phương án 2)
1. Thêm biến CSS để tính toán động bán kính khối lăng trụ trong `App.css`:
   ```css
   :root {
     --card-height: 507px; /* Sẽ được định nghĩa dựa trên tỉ lệ 3/4 của width 380px */
     --card-depth: calc(var(--card-height) / 3.464); /* h / (2 * sqrt(3)) */
   }
   ```
2. Thay đổi các lớp xoay trong `App.css`:
   ```css
   .face-1 { transform: rotateX(0deg) translateZ(var(--card-depth)); }
   .face-2 { transform: rotateX(120deg) translateZ(var(--card-depth)); }
   .face-3 { transform: rotateX(240deg) translateZ(var(--card-depth)); }

   .state-1 { transform: rotateX(0deg); }
   .state-2 { transform: rotateX(-120deg); }
   .state-3 { transform: rotateX(-240deg); }
   ```
3. Chạy thử nghiệm và tinh chỉnh góc nhìn (perspective) để khối 3D không bị méo.
