// Tạo (hoặc xoá) tài khoản thử để kiểm tra luồng đăng nhập mã HS và mượn trả trên localhost.
//   node scripts/tao-tai-khoan-thu.mjs <file.json>  → tạo tài khoản + một đầu sách thử, ghi mật khẩu vào file (để ngoài repo)
//   node scripts/tao-tai-khoan-thu.mjs --xoa        → xoá tài khoản thử, phiếu mượn và sách thử
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "better-auth/crypto";

try {
  process.loadEnvFile(".env.local");
} catch {
  // dùng biến môi trường sẵn có
}

const sql = neon(process.env.DATABASE_URL);
const TAI_KHOAN = [
  { ma: "test-hs-01", ten: "Học Sinh Thử", lop: "TEST", role: "nguoi_dung" },
  { ma: "test-thu-thu", ten: "Thủ Thư Thử", lop: null, role: "thu_thu" },
];

// Phiếu mượn của tài khoản thử: trả bản sách về giá trước khi xoá
await sql`update ban_sach set tinh_trang = 'tren_gia' where id in (
  select ban_sach_id from phieu_muon p join "user" u on u.id = p.user_id
  where u.username like 'test-%' and p.trang_thai = 'dang_muon')`;
await sql`delete from "user" where username like 'test-%'`;
await sql`delete from dau_sach where ten = 'Sách thử mượn trả'`;
if (process.argv.includes("--xoa")) {
  console.log("Đã xoá tài khoản thử.");
  process.exit(0);
}

const ketQua = [];
for (const tk of TAI_KHOAN) {
  const id = randomUUID();
  const matKhau = randomUUID().slice(0, 12);
  await sql`insert into "user" (id, name, email, email_verified, username, display_username, lop, role)
    values (${id}, ${tk.ten}, ${`${tk.ma}@hoc-sinh.invalid`}, true, ${tk.ma}, ${tk.ma}, ${tk.lop}, ${tk.role})`;
  await sql`insert into account (id, account_id, provider_id, user_id, password)
    values (${randomUUID()}, ${id}, 'credential', ${id}, ${await hashPassword(matKhau)})`;
  ketQua.push({ ma: tk.ma, matKhau, role: tk.role });
}
// Một đầu sách thử có 2 bản trên giá
const [ds] = await sql`insert into dau_sach (ten, tac_gia) values ('Sách thử mượn trả', 'Tác giả thử') returning id`;
await sql`insert into ban_sach (so_dkcb, dau_sach_id, kho) values ('TEST.00001', ${ds.id}, 'TEST'), ('TEST.00002', ${ds.id}, 'TEST')`;

const file = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "tai-khoan-thu.json";
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(ketQua, null, 2));
console.log("Đã tạo", ketQua.map((k) => k.ma).join(", "), "và sách thử →", file);
