// Sao lưu toàn bộ dữ liệu Neon ra file JSON và tải lên Google Drive (thư mục "SaoLuu" trong kho sách).
//   npm run db:backup
// Chạy thủ công định kỳ (ví dụ đầu mỗi tháng). File cũng được giữ ở thư mục backups/ (đã gitignore).
// Bỏ qua bảng session / verification vì chỉ là dữ liệu đăng nhập tạm thời.
import { mkdirSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

try {
  process.loadEnvFile(".env.local");
} catch {
  // dùng biến môi trường sẵn có
}

const SKIP_TABLES = new Set(["session", "verification", "__drizzle_migrations"]);
const BACKUP_FOLDER_NAME = "SaoLuu";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Thiếu biến môi trường ${name}`);
    process.exit(1);
  }
  return value;
}

async function dumpDatabase() {
  const sql = neon(requireEnv("DATABASE_URL"));
  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name`;

  const data = {};
  for (const { table_name: table } of tables) {
    if (SKIP_TABLES.has(table)) continue;
    data[table] = await sql.query(`select * from "${table.replaceAll('"', '""')}"`);
    console.log(`  ${table}: ${data[table].length} dòng`);
  }
  return { createdAt: new Date().toISOString(), tables: data };
}

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      refresh_token: requireEnv("GOOGLE_DRIVE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Không lấy được access token Google: ${body.error} ${body.error_description ?? ""}`);
  return body.access_token;
}

async function findOrCreateBackupFolder(token) {
  const parent = requireEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  const q = `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and '${parent}' in parents and trashed=false`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?${new URLSearchParams({ q, fields: "files(id)" })}`, {
    headers,
  }).then((r) => r.json());
  if (found.files?.length) return found.files[0].id;
  const created = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers,
    body: JSON.stringify({ name: BACKUP_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder", parents: [parent] }),
  }).then((r) => r.json());
  return created.id;
}

async function uploadToDrive(fileName, content) {
  const token = await getAccessToken();
  const folderId = await findOrCreateBackupFolder(token);
  const boundary = `saoluu${Date.now()}`;
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify({ name: fileName, parents: [folderId] }) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    content +
    `\r\n--${boundary}--`;
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) throw new Error(`Tải lên Drive thất bại: ${res.status} ${await res.text()}`);
  return res.json();
}

console.log("Đang đọc dữ liệu từ Neon…");
const backup = await dumpDatabase();
const content = JSON.stringify(backup);
const fileName = `thu-vien-${backup.createdAt.slice(0, 10)}.json`;

mkdirSync("backups", { recursive: true });
writeFileSync(`backups/${fileName}`, content);
console.log(`✔ Đã lưu backups/${fileName} (${(content.length / 1024).toFixed(0)} KB)`);

const file = await uploadToDrive(fileName, content);
console.log(`✔ Đã tải lên Drive: ${file.webViewLink}`);
