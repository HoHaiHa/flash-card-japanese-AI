---
name: install
description: >
  Cài đặt Antigravity Solo Developer framework vào dự án hiện tại.
  Trigger khi: user nói "cài framework", "cài đặt SDLC", "setup skills", "/install", hoặc gõ /install.
---

# /install
**Role**: Solo Developer
**Mục đích**: Cài đặt bộ skill tối giản cho Solo Developer vào dự án hiện tại dưới thư mục `.antigravity/skills/`.

---

## Hướng dẫn thực hiện

### Bước 0 — Xác nhận cài đặt
Sử dụng công cụ `ask_question` để xác nhận cài đặt:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn có muốn cài đặt bộ skill Antigravity Solo Developer vào dự án này?",
      options: [
        "Có, tiến hành cài đặt ngay",
        "Không, hủy bỏ cài đặt"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 1 — Sao chép các file Skill của Solo Dev
Sao chép các file skill từ thư mục nguồn `antigravity-solo-dev/skills/` sang thư mục đích `.antigravity/skills/` trong dự án hiện tại:
- `pm/breakdown.md` -> `.antigravity/skills/pm/breakdown.md`
- `dev/analyze.md` -> `.antigravity/skills/dev/analyze.md`
- `dev/implement.md` -> `.antigravity/skills/dev/implement.md`
- `dev/review.md` -> `.antigravity/skills/dev/review.md`
- `dev/debug.md` -> `.antigravity/skills/dev/debug.md`
- `arch/adr.md` -> `.antigravity/skills/arch/adr.md`
- `sec/review.md` -> `.antigravity/skills/sec/review.md`
- `docs/update.md` -> `.antigravity/skills/docs/update.md`

### Bước 2 — Sao chép các tài liệu và templates phụ trợ
- Sao chép thư mục `templates/` (các templates `adr.md`, `github-issue.md`, `pr-description.md`, `html-artifact.html`...).
- Sao chép các tài liệu rủi ro và đo lường:
  - `docs/risk-classifier.md`
  - `docs/validation-matrix.md`
  - `docs/improvement-backlog.md` (chỉ tạo nếu chưa tồn tại, không ghi đè).

### Bước 3 — Tạo cấu trúc thư mục rỗng cho dự án
Tạo các thư mục chứa dữ liệu sau trong `docs/`:
- `docs/api/` (Kèm file `.gitkeep`)
- `docs/screens/` (Kèm file `.gitkeep`)
- `docs/tasks/` (Kèm file `.gitkeep`)
- `docs/decisions/` (Kèm file `.gitkeep`)

### Bước 4 — Báo cáo kết quả
Sau khi hoàn tất, in báo cáo tóm tắt các file đã sao chép thành công và hướng dẫn người dùng cấu hình dự án (file `AGENTS.md` hoặc `CLAUDE.md`).
