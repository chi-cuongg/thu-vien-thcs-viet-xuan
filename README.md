# Thư viện THCS Việt Xuân – Kho học liệu điện tử

Website thư viện số của Trường THCS Vĩnh Thành – Phân hiệu Việt Xuân: đọc sách điện tử, học liệu, đề thi và tra cứu sách giấy của thư viện. Toàn bộ chạy trên gói miễn phí, không cần cron.

- **Next.js 16** (App Router, Cache Components) + Tailwind CSS 4, deploy trên **Vercel**
- **Neon Postgres** + **Drizzle ORM** lưu thông tin sách, tài liệu, người dùng (DB tự ngủ khi không dùng, không bị tạm dừng)
- **Better Auth** đăng nhập bằng Google cho thủ thư, giáo viên; học sinh đọc không cần đăng nhập
- **Google Drive** (tài khoản của thư viện) lưu file sách; web nhúng trình xem của Drive

## Chạy ở máy local

```bash
npm install
cp .env.example .env.local   # rồi điền giá trị
npm run db:migrate           # tạo bảng + dữ liệu khởi tạo trên Neon
npm run dev                  # http://localhost:3000
```

Kiểm tra kết nối Drive: mở `http://localhost:3000/api/drive/health` → `{"ok":true,"folder":"ThuVienVietXuan"}`.

### CSDL (Neon + Drizzle)

- Tạo database: Vercel → *Storage* → *Create Database* → **Neon** (gói Free), gắn vào project, rồi chép `DATABASE_URL` vào `.env.local`.
- Sửa schema trong `src/db/schema.ts` → `npm run db:generate` để tạo file migration mới trong `drizzle/` → `npm run db:migrate`.
- `drizzle/0000_extensions.sql` tạo extension `unaccent`, `pg_trgm` và hàm `vn_unaccent` (tìm kiếm không dấu); `drizzle/0002_seed.sql` là dữ liệu danh mục ban đầu.
- `npm run db:studio` mở giao diện xem/sửa dữ liệu.

### Đăng nhập (Better Auth + Google)

- Dùng chung OAuth client với kho Drive. Thêm vào *Authorized redirect URIs* của client:
  `http://localhost:3000/api/auth/callback/google` và `https://<tên-miền>/api/auth/callback/google`.
- Email trong `ADMIN_EMAILS` được tự cấp quyền admin khi đăng nhập lần đầu. Người khác đăng nhập sẽ ở trạng thái "chưa được cấp quyền" cho tới khi admin cấp quyền giáo viên / thủ thư.
- Khi OAuth app còn ở chế độ **Testing**, chỉ các test user trên Google Cloud Console đăng nhập được và refresh token Drive hết hạn sau 7 ngày — cần publish app trước khi dùng thật.

### Google Drive

```bash
npm run drive:token
```

Mở trình duyệt để tài khoản giữ kho sách cấp quyền, rồi ghi `GOOGLE_DRIVE_REFRESH_TOKEN` và `GOOGLE_DRIVE_ROOT_FOLDER_ID` vào `.env.local`. Cần redirect URI `http://localhost:8080/oauth2/callback` trong OAuth client.

### Sao lưu

```bash
npm run db:backup
```

Xuất toàn bộ dữ liệu ra `backups/thu-vien-<ngày>.json` và tải lên thư mục `SaoLuu` trong kho Drive. Chạy thủ công định kỳ, ví dụ đầu mỗi tháng.

## Cấu trúc

```
src/app/                 trang: /, /danh-muc, /tu-sach, /tim-kiem, /tra-cuu, /dang-nhap, /quan-tri
src/app/api/             /api/auth/* (Better Auth), /api/drive/health
src/components/          header, footer, ô tìm kiếm, nút đăng nhập, trình xem Drive…
src/config/taxonomy.ts   danh mục, môn học, khối lớp, tủ sách (đồng bộ với drizzle/0002_seed.sql)
src/db/                  schema Drizzle và kết nối Neon
src/lib/auth.ts          cấu hình Better Auth; src/lib/session.ts lấy phiên, kiểm tra quyền
src/lib/google-drive.ts  gọi Drive API bằng refresh token (chỉ chạy ở server)
drizzle/                 migration SQL
scripts/                 lấy token Drive, sao lưu CSDL
```

## Deploy lên Vercel

Import repo trên Vercel, gắn database Neon (tự có `DATABASE_URL`), rồi khai báo các biến còn lại trong `.env.example` ở *Project Settings → Environment Variables*: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (tên miền thật), `ADMIN_EMAILS`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`. Chạy `npm run db:migrate` một lần với `DATABASE_URL` của Neon.
