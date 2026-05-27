# Analysis: STITCH-001

## Risk Classification — STITCH-001

**Input type**: spec-slice
**Risk checklist**: R-09 ✅ (Task không có test coverage hiện tại cho area bị ảnh hưởng)
**Lane**: normal
**Lý do**: Đây là một màn hình cấu hình học tập mới hoàn toàn, chưa có test coverage hiện tại cho component này.

---

## Phương án đã chọn: Phương án A (State-based Routing)
**Lý do**: Cân bằng tốt giữa tốc độ phát triển và khả năng bảo trì. Dự án hiện tại là một single-page app đơn giản ở mức khởi tạo, việc sử dụng React state để điều phối giữa các màn hình (`config`, `list`, `flashcard`) và lưu trữ global learning state giúp truyền dữ liệu trực tiếp, nhanh chóng và loại bỏ việc cài đặt các thư viện bên thứ ba phức tạp không cần thiết.

## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| `src/App.jsx` | [MODIFY] | Thêm state quản lý màn hình hiện tại (`currentScreen`), dữ liệu cấu hình học tập (`learningConfig`), và render component tương ứng. |
| `src/components/LearningConfig.jsx` | [NEW] | Component màn hình cấu hình với các trường Hướng dịch, Nội dung học, Chọn bài học, và nút "Bắt đầu học ngay". |
| `src/App.css` | [MODIFY] | Cập nhật CSS định dạng cho form cấu hình, căn chỉnh layout, và styling theo theme Seishun Learning (phông Inter, màu Primary Blue `#0040e0`, bo góc tròn `rounded-xl`). |

## Những phương án đã cân nhắc và lý do không chọn

- **Phương án B (React Router DOM):** Không chọn vì tăng độ phức tạp trong quản lý state giữa các URL không cần thiết cho quy mô hiện tại của ứng dụng. Đòi hỏi cài thêm package mới và cấu hình routing phức tạp hơn mà không mang lại giá trị thực tế vượt trội cho người học ở giai đoạn này.

## Câu hỏi mở còn lại

- [ ] Q-01: Danh sách các bài học (Bài 1, Bài 2...) trong tương lai có cần tải động qua API không, hay trước mắt fix cứng dạng mock data trong component? (Hiện tại sẽ thiết lập mock data bài học để chạy thử).
- [ ] Q-02: Phản hồi lỗi khi người dùng chưa chọn checkbox có cần hiển thị dạng Toast thông báo hay chỉ cần hiển thị text báo lỗi màu đỏ ngay dưới form? (Hiện tại sẽ hiển thị text báo lỗi màu đỏ để tối giản UI).
