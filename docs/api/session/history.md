# API: POST /api/session/end

**Endpoint**: `POST /api/session/end`  
**Domain**: Session  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Lưu lại thông tin kết quả học tập tổng quan sau khi hoàn thành một phiên học flashcard để lưu trữ lịch sử học tập.

## Authentication

- **Required**: No
- **Type**: None
- **Permission**: Public

## Request

### Request Body

```json
{
  "total_cards": 10,
  "learned_count": 8,
  "forgot_count": 2
}
```

| Field | Type | Required | Validation | Mô tả |
|-------|------|----------|-----------|-------|
| `total_cards` | number | Yes | Min: 1 | Tổng số thẻ đã học trong phiên này. |
| `learned_count` | number | Yes | Min: 0 | Số lượng từ người học đánh giá là "Đã thuộc". |
| `forgot_count` | number | Yes | Min: 0 | Số lượng từ người học đánh giá là "Chưa thuộc". |

## Response

### Success Response

**Status**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 4,
    "total_cards": 10,
    "learned_count": 8,
    "forgot_count": 2,
    "created_at": "2026-05-30T09:35:00.000Z"
  },
  "message": "Lưu kết quả phiên học thành công."
}
```

| Field | Type | Mô tả |
|-------|------|-------|
| `data.id` | number | ID tự sinh của bản ghi lịch sử phiên học. |
| `data.created_at` | string | Thời gian ghi nhận kết quả. |

### Error Responses

| Status | Code | Mô tả | Khi nào |
|--------|------|-------|---------|
| `400` | `VALIDATION_ERROR` | Thiếu hoặc sai giá trị đầu vào | Khi các giá trị âm hoặc thiếu trường bắt buộc |
| `500` | `INTERNAL_ERROR` | Lỗi kết nối database | Lỗi kết nối |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Dữ liệu được ghi trực tiếp vào bảng `study_sessions` trên Supabase. |
| BR-002 | `total_cards` phải bằng tổng `learned_count + forgot_count`. |

## Examples

### Ví dụ request thành công

```bash
curl -X POST https://esbareagmqeyswznwfwa.supabase.co/rest/v1/study_sessions \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {anon_key}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "total_cards": 10,
    "learned_count": 8,
    "forgot_count": 2
  }'
```
