// Lấy refresh token Google Drive cho kho sách (chạy 1 lần trên máy local):
//   node scripts/get-drive-token.mjs
// Dùng OAuth client trong .env.local, mở trình duyệt để tài khoản Google giữ kho sách cấp quyền,
// rồi ghi GOOGLE_DRIVE_REFRESH_TOKEN (và GOOGLE_DRIVE_ROOT_FOLDER_ID nếu còn trống) vào .env.local.
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { exec } from "node:child_process";

const ENV_FILE = new URL("../.env.local", import.meta.url);
const ROOT_FOLDER_NAME = "ThuVienVietXuan";
const SCOPE = "https://www.googleapis.com/auth/drive";

const envText = readFileSync(ENV_FILE, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => /^\w+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirectUri = env.GOOGLE_OAUTH_REDIRECT_URI;
if (!clientId || !clientSecret || !redirectUri) {
  console.error("Thiếu GOOGLE_OAUTH_CLIENT_ID / SECRET / REDIRECT_URI trong .env.local");
  process.exit(1);
}

const redirect = new URL(redirectUri);
const state = randomBytes(16).toString("hex");
const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // bắt Google trả refresh token kể cả khi đã cấp quyền trước đó
    state,
  });

function setEnv(updates) {
  let text = readFileSync(ENV_FILE, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    text = re.test(text) ? text.replace(re, line) : text.trimEnd() + "\n" + line + "\n";
  }
  writeFileSync(ENV_FILE, text);
}

async function drive(path, accessToken, init = {}) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`Drive API ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function findOrCreateRootFolder(accessToken) {
  const q = `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`;
  const { files } = await drive(`files?${new URLSearchParams({ q, fields: "files(id,name)" })}`, accessToken);
  if (files.length) return { id: files[0].id, created: false };
  const folder = await drive("files?fields=id", accessToken, {
    method: "POST",
    body: JSON.stringify({ name: ROOT_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
  return { id: folder.id, created: true };
}

async function handleCallback(url) {
  if (url.searchParams.get("state") !== state) throw new Error("state không khớp, hãy chạy lại script");
  const error = url.searchParams.get("error");
  if (error) throw new Error(`Google trả lỗi: ${error}`);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: url.searchParams.get("code"),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const token = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`Đổi code lấy token thất bại: ${JSON.stringify(token)}`);
  if (!token.refresh_token) throw new Error("Google không trả refresh_token — thu hồi quyền ứng dụng ở myaccount.google.com/permissions rồi chạy lại");

  const about = await drive("about?fields=user(emailAddress),storageQuota", token.access_token);
  const updates = { GOOGLE_DRIVE_REFRESH_TOKEN: token.refresh_token };
  let folderNote = `giữ nguyên GOOGLE_DRIVE_ROOT_FOLDER_ID=${env.GOOGLE_DRIVE_ROOT_FOLDER_ID}`;
  if (!env.GOOGLE_DRIVE_ROOT_FOLDER_ID) {
    const folder = await findOrCreateRootFolder(token.access_token);
    updates.GOOGLE_DRIVE_ROOT_FOLDER_ID = folder.id;
    folderNote = `${folder.created ? "đã tạo" : "dùng"} thư mục "${ROOT_FOLDER_NAME}": https://drive.google.com/drive/folders/${folder.id}`;
  }
  setEnv(updates);

  const q = about.storageQuota;
  const gb = (n) => (Number(n) / 1024 ** 3).toFixed(1);
  console.log(`\n✔ Tài khoản: ${about.user.emailAddress}`);
  console.log(`✔ Dung lượng: đã dùng ${gb(q.usage)} GB / ${q.limit ? gb(q.limit) + " GB" : "không giới hạn"}`);
  console.log(`✔ ${folderNote}`);
  console.log("✔ Đã ghi GOOGLE_DRIVE_REFRESH_TOKEN vào .env.local (không in ra màn hình)");
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, redirect.origin);
  if (url.pathname !== redirect.pathname) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  try {
    await handleCallback(url);
    res.end("<h2>Đã cấp quyền xong. Có thể đóng tab này.</h2>");
  } catch (err) {
    console.error("\n✘", err.message);
    res.end(`<h2>Lỗi: ${err.message}</h2>`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.on("error", (err) => {
  console.error(`Không mở được cổng ${redirect.port}: ${err.message} (DigitalLibrary có đang chạy ở cổng này không?)`);
  process.exit(1);
});

server.listen(Number(redirect.port) || 80, redirect.hostname, () => {
  console.log("Mở link sau và đăng nhập bằng tài khoản Google giữ kho sách:\n");
  console.log(authUrl + "\n");
  if (process.platform === "win32") exec(`start "" "${authUrl}"`);
  else exec(`${process.platform === "darwin" ? "open" : "xdg-open"} "${authUrl}"`);
});
