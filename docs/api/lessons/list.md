# API: GET /api/lessons

**Endpoint**: `GET /api/lessons`  
**Domain**: Lessons  
**Last updated**: 2026-05-30 09:30 JST  
**Updated by task**: SUPABASE-002  
**Commit**: `draft` — Add API documentation baseline

---

## Mô tả

Lấy danh sách các bài học hiện có trong cơ sở dữ liệu để hiển thị trên giao diện cấu hình học tập.

## Authentication

- **Required**: No
- **Type**: None
- **Permission**: Public

## Request

### Headers

| Key | Required | Value |
|-----|----------|-------|
| `Content-Type` | No | `application/json` |

### Request Body

Không áp dụng.

## Response

### Success Response

**Status**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Lesson 1",
    "level": "N5"
  },
  {
    "id": 2,
    "name": "Lesson 2",
    "level": "N5"
  }
]
```

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | number | ID định danh của bài học (Primary Key). |
| `name` | string | Tên bài học. |
| `level` | string | Cấp độ JLPT mặc định của bài học (ví dụ: N5). |

### Error Responses

| Status | Code | Mô tả | Khi nào |
|--------|------|-------|---------|
| `500` | `INTERNAL_ERROR` | Lỗi truy vấn database hoặc kết nối mạng | Khi Supabase bị ngắt kết nối |

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Danh sách bài học được sắp xếp theo thời gian tạo tăng dần (`created_at` ASC). |

## Examples

### Ví dụ request thành công

```bash
curl -X GET https://esbareagmqeyswznwfwa.supabase.co/rest/v1/lessons?select=id,name,level&order=created_at.asc \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {anon_key}"
```
