# API: GET/POST /api/user/study-settings

**Endpoint**: `GET/POST /api/user/study-settings`  
**Domain**: User Settings  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Đọc và ghi cấu hình học tập gần nhất của người dùng nhằm giữ nguyên cài đặt khi mở lại ứng dụng.

## Authentication

- **Required**: No
- **Type**: None
- **Permission**: Public

## Request / Response (Local Storage Integration)

> [!NOTE]
> Do tính chất Single-user/Shared DB không dùng Auth, API này được giả lập gọi trực tiếp tới bộ nhớ cục bộ `localStorage` của trình duyệt web dưới key `seishun_study_settings` để tránh người học ghi đè cấu hình của nhau.

### Cấu trúc dữ liệu cấu hình (Schema)

```json
{
  "translationDirection": "ja-vi",
  "contentTypes": ["vocab", "sentence"],
  "selectedLessons": [1, 2]
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `translationDirection` | string | Yes | Hướng dịch học tập: `ja-vi` (Nhật-Việt) hoặc `vi-ja` (Việt-Nhật). |
| `contentTypes` | array of strings | Yes | Loại thẻ học: mảng chứa các giá trị `vocab`, `kanji`, `sentence`. |
| `selectedLessons` | array of numbers | Yes | Mảng các ID bài học được chọn học. |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Cấu hình học tập luôn được lưu trữ tại thiết bị người dùng (`localStorage`), không lưu đồng bộ lên cloud database. |
| BR-002 | Khi người dùng mở ứng dụng, nếu chưa có cấu hình học tập nào trong `localStorage`, hệ thống sẽ sử dụng cấu hình mặc định: `translationDirection = 'ja-vi'`, `contentTypes = ['vocab', 'sentence']`, `selectedLessons = []`. |
