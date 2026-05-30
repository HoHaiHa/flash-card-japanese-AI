# API: GET /api/session/start

**Endpoint**: `GET /api/session/start`  
**Domain**: Session  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Tải danh sách các thẻ từ nhiều bài học được chọn và lọc theo loại nội dung đã cấu hình để khởi tạo phiên học flashcard.

## Authentication

- **Required**: No
- **Type**: None
- **Permission**: Public

## Request

### Query Parameters

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `lesson_ids` | string | Yes | - | Danh sách ID các bài học, phân tách bằng dấu phẩy (ví dụ: `1,2`). |
| `content_types` | string | Yes | - | Danh sách các loại nội dung học, phân tách bằng dấu phẩy (ví dụ: `vocab,sentence`). |

## Response

### Success Response

**Status**: `200 OK`

```json
[
  {
    "id": "v1",
    "level": "N5",
    "kana": "べんきょうする",
    "kanji": "勉強する",
    "sinoVietnamese": "CỐ GẮNG & CƯỜNG TRÁNG",
    "details": "Âm Hán: MIỄN CƯỜNG",
    "components": [
      {
        "char": "勉",
        "meaning": "Miễn (cố gắng hết sức)"
      }
    ],
    "definition": "Học tập, nghiên cứu",
    "exampleJp": "毎日日本語を勉強しています。",
    "exampleVi": "Mỗi ngày tôi đều học tiếng Nhật.",
    "type": "vocab",
    "favorite": false,
    "mastered": false
  }
]
```

### Error Responses

| Status | Code | Mô tả | Khi nào |
|--------|------|-------|---------|
| `400` | `VALIDATION_ERROR` | Thiếu tham số bắt buộc | Khi không truyền `lesson_ids` hoặc `content_types` |
| `500` | `INTERNAL_ERROR` | Lỗi kết nối database | Lỗi kết nối |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Danh sách trả về bao gồm cả từ vựng/chữ hán từ bảng `vocabularies` và mẫu câu từ bảng `sentences` thỏa mãn điều kiện lọc. |

## Examples

### Ví dụ request thành công

```bash
curl -X GET "https://esbareagmqeyswznwfwa.supabase.co/rest/v1/vocabularies?lesson_id=in.(1,2)" \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {anon_key}"
```
