# API: POST /api/vocab/favorite

**Endpoint**: `POST /api/vocab/favorite`  
**Domain**: Vocabularies  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Cập nhật trạng thái yêu thích (Favorite) của một từ vựng, chữ hán hoặc mẫu câu cụ thể.

## Authentication

- **Required**: No
- **Type**: None
- **Permission**: Public

## Request

### Request Body

```json
{
  "id": "v1",
  "type": "vocab",
  "favorite": true
}
```

| Field | Type | Required | Validation | Mô tả |
|-------|------|----------|-----------|-------|
| `id` | string | Yes | - | ID của thẻ cần cập nhật. |
| `type` | string | Yes | `vocab` \| `kanji` \| `sentence` | Phân loại của thẻ để xác định bảng cần update. |
| `favorite` | boolean | Yes | - | Trạng thái yêu thích muốn thiết lập. |

## Response

### Success Response

**Status**: `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật trạng thái yêu thích thành công."
}
```

### Error Responses

| Status | Code | Mô tả | Khi nào |
|--------|------|-------|---------|
| `400` | `VALIDATION_ERROR` | Thiếu hoặc sai kiểu dữ liệu | Trùng lặp, thiếu trường bắt buộc |
| `404` | `NOT_FOUND` | Không tìm thấy thẻ | ID thẻ không tồn tại |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Nếu `type` là `sentence`, hệ thống sẽ cập nhật trường `favorite` trên bảng `sentences`. Ngược lại (type là `vocab` hoặc `kanji`), sẽ cập nhật trên bảng `vocabularies`. |

## Examples

### Ví dụ request thành công

```bash
curl -X PATCH https://esbareagmqeyswznwfwa.supabase.co/rest/v1/vocabularies?id=eq.v1 \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {anon_key}" \
  -H "Content-Type: application/json" \
  -d '{"favorite": true}'
```
