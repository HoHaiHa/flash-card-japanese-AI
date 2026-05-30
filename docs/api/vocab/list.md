# API: GET /api/vocab

**Endpoint**: `GET /api/vocab`  
**Domain**: Vocabularies  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Tải danh sách các từ vựng, mẫu câu, chữ hán của một bài học cụ thể để hiển thị trên màn hình danh sách học tập.

## Authentication

- **Required**: No
- **Type**: None
- **Permission**: Public

## Request

### Query Parameters

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `lesson_id` | number | Yes | - | ID của bài học cần lấy dữ liệu. |

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
      },
      {
        "char": "強",
        "meaning": "Cường (mạnh mẽ, cứng cáp)"
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

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | string | ID của từ (dạng chuỗi `v1`, `s1`, `k1`). |
| `level` | string | Cấp độ từ vựng (N5, N4...). |
| `kana` | string | Phiên âm Furigana/Kana. |
| `kanji` | string | Chữ Kanji hoặc chữ gốc. |
| `sinoVietnamese` | string | Âm Hán Việt ý nghĩa. |
| `details` | string | Chi tiết âm Hán tự. |
| `components` | array | Danh sách các bộ thủ cấu thành. |
| `definition` | string | Nghĩa tiếng Việt. |
| `exampleJp` | string | Câu ví dụ tiếng Nhật. |
| `exampleVi` | string | Câu ví dụ tiếng Việt dịch. |
| `type` | string | Phân loại thẻ: `vocab`, `kanji`, `sentence`. |
| `favorite` | boolean | Trạng thái yêu thích. |
| `mastered` | boolean | Trạng thái đã thuộc bài (status = 'learned'). |

### Error Responses

| Status | Code | Mô tả | Khi nào |
|--------|------|-------|---------|
| `400` | `VALIDATION_ERROR` | Thiếu `lesson_id` | Khi không truyền query param bài học |
| `500` | `INTERNAL_ERROR` | Lỗi kết nối database | Lỗi kết nối |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Dữ liệu được tổng hợp từ hai bảng `vocabularies` và `sentences` có cùng `lesson_id`. |
| BR-002 | Trạng thái `mastered` trên UI được map từ cột `status` trong DB (nếu `status` là `learned` thì `mastered` là `true`). |

## Examples

### Ví dụ request thành công

```bash
curl -X GET https://esbareagmqeyswznwfwa.supabase.co/rest/v1/vocabularies?lesson_id=eq.1 \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {anon_key}"
```
