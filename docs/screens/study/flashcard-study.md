# Screen: Học thẻ 3 mặt (3-sided Flashcard)

**Route/URL**: `/study/flashcard`  
**Feature**: Flashcard Study Session  
**Last updated**: 2026-05-24 16:00 JST  
**Updated by task**: STITCH-001  
**Commit**: `[short-sha]` — Initial setup of 3-sided flashcard study screen spec

---

## Mô tả

Màn hình học từ vựng sử dụng thẻ flashcard 3 mặt xoay 3D độc đáo (mặt trước: từ vựng/Kanji, mặt giữa: âm Hán/cấu tạo chữ, mặt sau: nghĩa tiếng Việt/ví dụ). Hỗ trợ các nút thao tác nhanh (lọc chưa thuộc, ngẫu nhiên, yêu thích) và đánh giá thuộc/chưa thuộc. Dành cho người học luyện nhớ từ vựng hiệu quả cao.

## Điều kiện truy cập

- **Role yêu cầu**: User
- **Authentication**: Required
- **Pre-condition**: Người dùng đã hoàn thành cấu hình học tập tại màn hình `/study/config`.

## Layout & Components

### 1. Top App Bar & Progress
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Nút Back | Button (chevron_left) | Yes | Góc trên bên trái, dùng để quay lại trang trước |
| Tiêu đề tiến độ | Label | Yes | "Session Progress" |
| Số lượng tiến độ | Label | Yes | Hiển thị số thẻ đã học trên tổng số (Ví dụ: `12 / 20` màu xanh dương) |
| Avatar | Image/Icon | No | Hình tròn góc trên bên phải |
| Thanh tiến độ | Progress Bar | Yes | Thanh ngang hiển thị tỷ lệ hoàn thành (Ví dụ: `60%` màu xanh dương trên nền xám nhạt), bo tròn hai đầu |

### 2. Quick Action Buttons (Hàng nút chức năng nhanh)
Nằm ngay phía trên thẻ flashcard, gồm 3 nút hình viên thuốc (pill shape), nền xanh nhạt (`bg-surface-container-low`):
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Chưa thuộc | Button | Yes | Icon dấu `X` màu đỏ, nhãn "Chưa thuộc". Dùng để lọc nhanh danh sách từ chưa thuộc |
| Ngẫu nhiên | Button | Yes | Icon hai mũi tên chéo `shuffle` màu xanh dương, nhãn "Ngẫu nhiên". Trộn thẻ |
| Yêu thích | Button | Yes | Icon trái tim `favorite` màu nâu/đỏ, nhãn "Yêu thích". Lọc nhanh danh sách từ yêu thích |

### 3. Main Flashcard (Thẻ 3 mặt xoay 3D)
Khung chứa thẻ có hiệu ứng 3D (`perspective: 1000px`). Khi click vào thẻ sẽ xoay vòng tròn qua 3 mặt:

#### Mặt 1: Từ vựng / Chữ Hán (Front - face-1)
* **Badge cấp độ**: Góc trên bên trái (Ví dụ: `N2` trong chip màu xanh dương).
* **Từ vựng Kanji**: Hiển thị chính giữa, cỡ chữ rất lớn (`font-display-jp`).
* **Phiên âm (Furigana)**: Hiển thị nhỏ hơn ngay dưới Kanji (`こうぞう`).
* **Hướng dẫn**: Góc dưới cùng của thẻ: Icon bàn tay chạm `touch_app` + nhãn "Chạm để xem âm Hán".

#### Mặt 2: Âm Hán & Cấu tạo (Middle - face-2)
* **Tiêu đề**: "ÂM HÁN & CẤU TRÚC" (chữ hoa, nhỏ).
* **Âm Hán**: Hiển thị trong khung nổi bật (Ví dụ: "Âm Hán: CẤU TẠO").
* **Chi tiết bộ thủ**: Danh sách các bộ cấu thành chữ Hán đó (Ví dụ: "木 - Bộ Mộc (Gỗ)", "宀 - Bộ Miên (Mái nhà)").
* **Hướng dẫn**: Góc dưới cùng: Icon xoay `rotate_right` + nhãn "Xem nghĩa & Ví dụ".

#### Mặt 3: Nghĩa & Ví dụ (Back - face-3)
* **Tiêu đề**: "NGHĨA TIẾNG VIỆT" (chữ hoa, nhỏ).
* **Nghĩa chính**: Chữ to màu xanh dương (Ví dụ: "Cấu trúc / Cấu tạo").
* **Ví dụ minh họa**: 
  * Câu ví dụ tiếng Việt (in nghiêng).
  * Câu ví dụ tiếng Nhật tương ứng ngay bên dưới.
* **Hướng dẫn**: Góc dưới cùng: Icon reset `restart_alt` + nhãn "Về mặt trước".

### 4. Bottom Response Actions (Nút đánh giá)
| Component | Type | Required | Mô tả |
|-----------|------|----------|-------|
| Chưa thuộc | Button | Yes | Nút bên trái. Viền đỏ chữ đỏ, nền trắng, chứa icon `close` và nhãn "Chưa thuộc" |
| Đã thuộc | Button | Yes | Nút bên phải. Nền xanh dương chữ trắng, viền dưới 4px tạo hiệu ứng nổi 3D tactile, chứa icon check hình tròn `check_circle` và nhãn "Đã thuộc" |

## Business Rules (màn hình này)

| ID | Rule |
|----|------|
| BR-001 | Thẻ flashcard hỗ trợ xoay 3D tuần tự: **Mặt 1 (Kanji)** $\rightarrow$ click $\rightarrow$ **Mặt 2 (Âm Hán)** $\rightarrow$ click $\rightarrow$ **Mặt 3 (Nghĩa)** $\rightarrow$ click $\rightarrow$ **Mặt 1**. Sử dụng CSS 3D Transforms (`rotateY`). |
| BR-002 | Khi người dùng nhấn nút đánh giá ở dưới hoặc phím tắt tương ứng: <br> 1. Hệ thống ghi nhận trạng thái từ vựng đó (thuộc hay chưa thuộc). <br> 2. Kích hoạt hiệu ứng flash màu nền toàn trang: chớp xanh lá nhẹ (`rgba(0,108,70,0.1)`) khi chọn "Đã thuộc", chớp đỏ nhẹ (`rgba(186,26,26,0.1)`) khi chọn "Chưa thuộc". <br> 3. Tự động reset thẻ về **Mặt 1** trước khi chuyển sang thẻ tiếp theo. <br> 4. Thực hiện hiệu ứng thu nhỏ và ẩn dần (pop animation) để chuyển sang thẻ mới. |
| BR-003 | Tiến độ học tập ở Header (`X / Y`) và thanh progress bar sẽ tăng lên mỗi khi người dùng nhấn nút đánh giá thuộc/chưa thuộc của một từ mới. |
| BR-004 | Nhấn nút **Back (<)** sẽ lưu lại tiến độ phiên học hiện tại vào database và quay về màn hình cấu hình học tập `/study/config`. |
| BR-005 | Nhấn các nút chức năng nhanh phía trên (Chưa thuộc, Ngẫu nhiên, Yêu thích) sẽ tiến hành lọc hoặc trộn lại danh sách thẻ trong phiên học hiện tại realtime. |

## User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Xoay thẻ | Click vào bất kỳ khu vực nào trên Thẻ flashcard | Thẻ xoay 120 độ theo trục Y để chuyển sang mặt tiếp theo |
| Đánh giá "Chưa thuộc" | Click nút "Chưa thuộc" ở dưới | Lưu trạng thái chưa thuộc, chớp màn hình đỏ, chuyển sang từ tiếp theo |
| Đánh giá "Đã thuộc" | Click nút "Đã thuộc" ở dưới | Lưu trạng thái đã thuộc, chớp màn hình xanh lá, chuyển sang từ tiếp theo |
| Lọc "Chưa thuộc" | Click nút chức năng "Chưa thuộc" phía trên | Chỉ hiển thị các thẻ chưa thuộc trong bộ từ hiện tại |
| Trộn thẻ | Click nút chức năng "Ngẫu nhiên" phía trên | Trộn ngẫu nhiên thứ tự các thẻ còn lại trong session |
| Lọc "Yêu thích" | Click nút chức năng "Yêu thích" phía trên | Chỉ hiển thị các thẻ đã được đánh dấu yêu thích |

## Validation Messages

*Không áp dụng.*

## States

| State | Mô tả | Hiển thị |
|-------|-------|---------|
| Loading | Đang tải dữ liệu từ vựng cho phiên học | Spinner / Card skeleton |
| Empty | Đã học hết toàn bộ thẻ trong phiên hiện tại | Màn hình chúc mừng (Congratulation) với kết quả tổng hợp |
| Error | Không thể đồng bộ trạng thái học của từ vựng | Toast message thông báo lỗi đồng bộ |

## API Calls

| Action | Method | Endpoint | Docs |
|--------|--------|----------|------|
| Tải bộ từ vựng phiên học | GET | `/api/session/start` | `docs/api/session/start.md` |
| Cập nhật trạng thái từ | POST | `/api/vocab/update-status` | `docs/api/vocab/update-status.md` |
| Kết thúc phiên học | POST | `/api/session/end` | `docs/api/session/end.md` |

## Ghi chú

- CSS xoay 3 mặt sử dụng cấu trúc khối lăng trụ tam giác trong không gian 3D (`preserve-3d`), các mặt được xoay các góc `rotateY(0deg)`, `rotateY(120deg)`, `rotateY(240deg)` và card inner xoay các góc ngược lại (`rotateY(0deg)`, `rotateY(-120deg)`, `rotateY(-240deg)`) để hiển thị đúng mặt tương ứng.
- Khi xoay hoặc đổi thẻ, áp dụng transition mượt mà (`transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)`).
