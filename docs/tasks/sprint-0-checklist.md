# Sprint 0 Checklist — Khởi tạo dự án my-react-app

---

## 1. Setup môi trường & Cấu trúc mã nguồn

- [x] Khởi tạo mã nguồn dự án (Vite + React).
- [x] Khởi tạo framework **Agentic Development Lifecycle** vào dự án (`.antigravity/` folder).
- [ ] Thiết lập Git Branching Model (nhánh chính `main` và các nhánh tính năng `feature/*`).
- [ ] Cấu hình biến môi trường bằng cách tạo file `.env.example` chứa thông tin kết nối tới Supabase:
  - `VITE_SUPABASE_URL=`
  - `VITE_SUPABASE_ANON_KEY=`

---

## 2. Documentation & Quyết định kỹ thuật

- [x] Cấu hình và cập nhật bối cảnh dự án vào [AGENTS.md](file:///c:/project-ai/my-react-app/AGENTS.md).
- [x] Tạo quyết định kiến trúc [ADR-001: Lựa chọn Tech Stack](file:///c:/project-ai/my-react-app/docs/decisions/ADR-001.md).
- [x] Tạo quyết định kiến trúc [ADR-002: Lựa chọn cơ chế bảo mật & Auth](file:///c:/project-ai/my-react-app/docs/decisions/ADR-002.md).
- [ ] Khởi tạo tài liệu tổng quan cấu trúc codebase ban đầu tại `docs/baseline/codebase-overview.md`.

---

## 3. Tích hợp Supabase (Database-as-a-Service)

- [ ] Khởi tạo một project trên Supabase Console.
- [ ] Thiết lập các bảng dữ liệu ban đầu trong database.
- [ ] Bật Row Level Security (RLS) cho tất cả các bảng vừa tạo.
- [ ] Cấu hình policy cho phép đọc công khai (Read-Only for Anon Users) và cấm mọi thao tác ghi/sửa từ phía Client.
- [ ] Cài đặt gói `@supabase/supabase-js` ở Frontend React và viết module khởi tạo Supabase Client.
