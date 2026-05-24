# Quy trình xử lý Task nhỏ (Small Task Lifecycle)

Tài liệu này hướng dẫn chi tiết luồng xử lý tinh giản dành cho các task nhỏ trong dự án sử dụng framework **Agentic Development Lifecycle**. Quy trình này giúp tối ưu hóa hiệu năng của Agent và giảm thiểu thủ tục hành chính cho lập trình viên.

---

## 1. Phân loại Task nhỏ (Risk Lanes)

Trước khi bắt đầu, người tiếp nhận task cần đối chiếu với tài liệu [risk-classifier.md](file:///c:/project-ai/Agentic-Development-Lifecycle/docs/risk-classifier.md) để xếp vào làn đường (Lane) phù hợp:

* **Tiny Lane (Cực nhỏ)**: Sửa lỗi chính tả, thay đổi CSS đơn giản (màu sắc, khoảng cách), cập nhật text tĩnh.
* **Normal Lane (Bình thường)**: Thêm API endpoint mới, thêm trường thông tin vào form, refactor một hàm hoặc module nhỏ.

*(Lưu ý: Nếu task liên quan đến bảo mật, phân quyền, thay đổi cấu trúc Database ảnh hưởng dữ liệu cũ, hoặc API breaking change, bắt buộc phải đưa vào **High-Risk Lane** và cần Senior Dev phê duyệt thiết kế).*

---

## 2. Bảng phân công vai trò (Role Matrix)

| Giai đoạn | Vai trò | Công việc | Skill sử dụng | Sản phẩm đầu ra (Artifacts) |
|---|---|---|---|---|
| **1. Khởi tạo** | PM / BA | Nhận yêu cầu, mô tả lỗi -> Tạo Github/GitLab Issue | `/pm:breakdown` (optional) | Issue trên GitHub / GitLab |
| **2. Phân tích** | Developer | Tìm file liên quan, đề xuất cách sửa đổi | `/dev:analyze` | `docs/tasks/[TASK-ID]/analysis.md` |
| **3. Cài đặt** | Developer | Chỉnh sửa code, tự kiểm thử | `/dev:implement` | Mã nguồn hoàn thiện + `verification.md` |
| **4. Rà soát** | Developer / Tech Lead | Review chéo chất lượng code, bảo mật | `/dev:review` | Báo cáo review (4 lenses) |
| **5. PR & Merge** | Developer | Tạo Pull Request | `/dev:pr` | Pull Request Description |
| **6. Nghiệm thu** | QA Engineer | Kiểm thử lại tính năng trên môi trường test | Chạy test thủ công | Cập nhật `docs/tasks/[TASK-ID]/verification.md` |
| **7. Triển khai** | DevOps | Deploy bản vá lên staging/production | `/ops:deploy` | Hệ thống hoạt động ổn định |

---

## 3. Luồng xử lý chi tiết (Step-by-Step Flow)

### 3.1 Nhánh Tiny Lane (Sửa đổi trực tiếp)
Đối với các task thuộc Tiny Lane, luồng đi cực kỳ ngắn gọn:
1. **Lập trình viên** trực tiếp sửa code trên workspace.
2. Kiểm tra nhanh (Happy path).
3. Commit và tạo PR trực tiếp (Bỏ qua `/dev:analyze`, `/dev:implement`, `/dev:review`).
4. **QA** kiểm tra nhanh và **DevOps** deploy.

---

### 3.2 Nhánh Normal Lane (Quy trình chuẩn)

#### Bước 1: Tiếp nhận và Phân tích (`/dev:analyze`)
* **Hành động**: Developer nhận mã số Issue (ví dụ: `TASK-123`) và chạy lệnh:
  ```bash
  /dev:analyze
  ```
* **Nhiệm vụ của Agent**: Quét codebase để xác định các file bị ảnh hưởng và đề xuất 2 phương án chỉnh sửa kèm ưu/nhược điểm.
* **Cổng xác nhận (Gate)**: Dev xem xét các phương án được đề xuất trực tiếp trên terminal và chọn phương án tối ưu.
* **Kết quả**: Tạo ra file thiết kế nhỏ: `docs/tasks/TASK-123/analysis.md`.

#### Bước 2: Triển khai và Tự kiểm thử (`/dev:implement`)
* **Hành động**: Sau khi đồng ý phương án, Dev chạy lệnh:
  ```bash
  /dev:implement
  ```
* **Nhiệm vụ của Agent**: Tiến hành sửa đổi code theo từng file (file-by-file).
* **Cổng xác nhận (Gate)**: Dev xác nhận (Confirm) chất lượng sau khi Agent hoàn thành từng file rồi mới cho chạy file tiếp theo.
* **Tự nghiệm thu (Self-Test)**: Agent phân tích thay đổi và gợi ý 3-5 bước test thủ công. Dev tự chạy test và điền kết quả vào file nghiệm thu: `docs/tasks/TASK-123/verification.md`.

#### Bước 3: Đánh giá chất lượng (`/dev:review`)
* **Hành động**: Trước khi tạo PR, Dev hoặc Tech Lead chạy lệnh:
  ```bash
  /dev:review
  ```
* **Nhiệm vụ của Agent**: Đánh giá toàn diện thay đổi dựa trên 4 tiêu chí: Code Quality, Architecture, Performance, Security.
* **Cổng xác nhận (Gate)**: Phải nhận được đánh giá **Approve** hoặc **Approve with minor fixes** thì mới tiếp tục.

#### Bước 4: Tạo PR (`/dev:pr`)
* **Hành động**: Dev chạy lệnh:
  ```bash
  /dev:pr
  ```
* **Nhiệm vụ của Agent**: Tự động đọc code diff và file nghiệm thu `verification.md` để điền nội dung mô tả Pull Request (PR Description), đồng thời đính kèm kết quả test.
* Dev thực hiện gửi PR lên GitHub/GitLab.

#### Bước 5: QA Nghiệm thu độc lập
* **QA** lấy thông tin các bước test từ file `verification.md` của Dev để thực hiện kiểm thử độc lập.
* Nếu OK -> QA Approve PR. Nếu phát hiện lỗi -> QA comment trực tiếp và Dev sửa đổi.

#### Bước 6: DevOps Deploy (`/ops:deploy`)
* Sau khi PR được merge, **DevOps** (hoặc CI/CD tự động) chạy deploy bản vá.
* Chạy cập nhật baseline tài liệu bằng lệnh `/docs:update` nếu task này có cập nhật API hoặc màn hình giao diện.

---

## 4. Tóm tắt các chốt chặn (Gates) cho Task nhỏ

Để đảm bảo tốc độ nhưng vẫn giữ vững chất lượng, Dev cần nhớ 3 chốt chặn quan trọng sau:
1. **Gate 1 (Khi Phân tích)**: Phải tự mình chọn phương án kỹ thuật trong `/dev:analyze`, không phó mặc hoàn toàn cho Agent tự code mà không có định hướng.
2. **Gate 2 (Khi Code)**: Xác nhận chất lượng từng file trong `/dev:implement`, đảm bảo không có code thừa hoặc placeholder.
3. **Gate 3 (Trước khi PR)**: Bắt buộc chạy `/dev:review` để phát hiện sớm các lỗ hổng bảo mật hoặc lỗi logic nghiêm trọng trước khi gửi code cho reviewer.
