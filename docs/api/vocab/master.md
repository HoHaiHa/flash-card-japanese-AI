# API: POST /api/vocab/master

**Endpoint**: `POST /api/vocab/master`  
**Domain**: Vocabularies  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Cập nhật trạng thái thuộc bài (learned) hoặc quên (forgot) của một từ vựng, chữ hán hoặc mẫu câu.

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
  "status": "learned"
}
```

| Field | Type | Required | Validation | Mô tả |
|-------|------|----------|-----------|-------|
| `id` | string | Yes | - | ID của thẻ cần cập nhật. |
| `type` | string | Yes | `vocab` \| `kanji` \| `sentence` | Phân loại của thẻ để xác định bảng cần update. |
| `status` | string | Yes | `learned` \| `forgot` | Trạng thái ghi nhớ học tập. |

## Response

### Success Response

**Status**: `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật trạng thái ghi nhớ thành công."
}
```

### Error Responses

| Status | Code | Mô tả | Khi nào |
|--------|------|-------|---------|
| `400` | `VALIDATION_ERROR` | Thiếu hoặc sai giá trị trạng thái | `status` không nằm trong danh sách kiểm tra |
| `404` | `NOT_FOUND` | Không tìm thấy thẻ | ID thẻ không tồn tại |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Nếu `type` là `sentence`, hệ thống sẽ cập nhật trường `status` trên bảng `sentences`. Ngược lại (type là `vocab` hoặc `kanji`), sẽ cập nhật trên bảng `vocabularies`. |

## Examples

### Ví dụ request thành công

```bash
curl -X PATCH https://esbareagmqeyswznwfwa.supabase.co/rest/v1/vocabularies?id=eq.v1 \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {anon_key}" \
  -H "Content-Type: application/json" \
  -d '{"status": "learned"}'
```
