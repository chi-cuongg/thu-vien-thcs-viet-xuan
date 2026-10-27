# Thư viện THCS Việt Xuân – Kho học liệu điện tử

Website thư viện số của Trường THCS Vĩnh Thành – Phân hiệu Việt Xuân: đọc sách điện tử, học liệu, đề thi và tra cứu sách giấy của thư viện.

- **Next.js 16** (App Router, Cache Components) + Tailwind CSS 4, deploy trên **Vercel**
- **Supabase** (Postgres + đăng nhập) lưu thông tin sách, tài liệu, người dùng
- **Google Drive** (tài khoản của thư viện) lưu file sách; web nhúng trình xem của Drive

## Chạy ở máy local

```bash
npm install
cp .env.example .env.local   # rồi điền giá trị
npm run dev                  # http://localhost:3000
```

Kiểm tra kết nối Drive: mở `http://localhost:3000/api/drive/health` → `{"ok":true,"folder":"ThuVienVietXuan"}`.

### Lấy refresh token Google Drive

```bash
npm run drive:token
```

Script mở trình duyệt để tài khoản giữ kho sách cấp quyền, rồi ghi `GOOGLE_DRIVE_REFRESH_TOKEN` và `GOOGLE_DRIVE_ROOT_FOLDER_ID` vào `.env.local`. Redirect URI `http://localhost:8080/oauth2/callback` phải có trong OAuth client trên Google Cloud Console. Khi OAuth app còn ở chế độ **Testing**, refresh token hết hạn sau 7 ngày — cần publish app trước khi dùng thật.

### Supabase

1. Tạo project trên supabase.com, điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Chạy `supabase/migrations/20261027000000_init.sql` rồi `supabase/seed.sql` (SQL Editor, hoặc `supabase db push`).

## Cấu trúc

```
src/app/                 trang: /, /danh-muc, /tu-sach, /tim-kiem, /tra-cuu, /api/drive/health
src/components/          header, footer, ô tìm kiếm, trình xem Drive…
src/config/taxonomy.ts   danh mục, môn học, khối lớp, tủ sách (đồng bộ với supabase/seed.sql)
src/lib/google-drive.ts  gọi Drive API bằng refresh token (chỉ chạy ở server)
src/lib/supabase/        client Supabase
supabase/                schema, RLS, hàm tìm kiếm không dấu, dữ liệu khởi tạo
scripts/                 script tiện ích (lấy token Drive)
```

## Deploy lên Vercel

Import repo trên Vercel, khai báo các biến trong `.env.example` ở *Project Settings → Environment Variables* (trừ `GOOGLE_OAUTH_REDIRECT_URI`, chỉ dùng ở local).
