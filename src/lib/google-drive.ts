import "server-only";

// Truy cập Google Drive của kho sách bằng OAuth refresh token (tài khoản của trường).
// Service account không dùng được để upload vì không có dung lượng lưu trữ.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

export const FOLDER_MIME = "application/vnd.google-apps.folder";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
  modifiedTime?: string;
  webViewLink?: string;
};

const FILE_FIELDS = "id,name,mimeType,size,parents,modifiedTime,webViewLink";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name}`);
  return value;
}

export function rootFolderId(): string {
  return requireEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID");
}

// Access token sống ~1 giờ; giữ lại trong bộ nhớ của instance serverless để không xin lại mỗi request.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      refresh_token: requireEnv("GOOGLE_DRIVE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok) {
    // invalid_grant thường là refresh token hết hạn (OAuth app còn ở chế độ Testing) hoặc bị thu hồi
    throw new Error(`Không lấy được access token Google: ${body.error} ${body.error_description ?? ""}`);
  }
  cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return cachedToken.value;
}

async function driveFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function getFile(fileId: string): Promise<DriveFile> {
  return driveFetch(`${DRIVE_API}/files/${fileId}?fields=${FILE_FIELDS}`);
}

export async function listFolder(
  folderId: string = rootFolderId(),
  pageToken?: string,
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    fields: `nextPageToken,files(${FILE_FIELDS})`,
    orderBy: "folder,name",
    pageSize: "200",
  });
  if (pageToken) params.set("pageToken", pageToken);
  return driveFetch(`${DRIVE_API}/files?${params}`);
}

export function createFolder(name: string, parentId: string = rootFolderId()): Promise<DriveFile> {
  return driveFetch(`${DRIVE_API}/files?fields=${FILE_FIELDS}`, {
    method: "POST",
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  });
}

/**
 * Tạo phiên upload resumable. Trình duyệt dùng URL trả về để PUT file thẳng lên Google,
 * không đi qua Vercel (giới hạn body ~4,5 MB). Truyền `origin` của trang web để Google cho phép CORS.
 */
export async function createResumableUploadSession(input: {
  name: string;
  mimeType: string;
  size: number;
  parentId?: string;
  origin: string;
}): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(`${UPLOAD_API}/files?uploadType=resumable&fields=${FILE_FIELDS}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": input.mimeType,
      "X-Upload-Content-Length": String(input.size),
      Origin: input.origin,
    },
    body: JSON.stringify({ name: input.name, parents: [input.parentId ?? rootFolderId()] }),
    cache: "no-store",
  });
  const uploadUrl = res.headers.get("location");
  if (!res.ok || !uploadUrl) throw new Error(`Không tạo được phiên upload: ${res.status} ${await res.text()}`);
  return uploadUrl;
}

/** Cho phép ai có link đều xem được — cần để nhúng trình xem Drive vào trang. */
export async function makePublicReadable(fileId: string): Promise<void> {
  await driveFetch(`${DRIVE_API}/files/${fileId}/permissions`, {
    method: "POST",
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
}

/** Ẩn nút tải, in, sao chép trong trình xem Drive với người chỉ có quyền xem. */
export async function setDownloadRestricted(fileId: string, restricted: boolean): Promise<void> {
  await driveFetch(`${DRIVE_API}/files/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify({ copyRequiresWriterPermission: restricted }),
  });
}

export async function getStorageQuota(): Promise<{ limit?: string; usage: string }> {
  const about = await driveFetch<{ storageQuota: { limit?: string; usage: string } }>(
    `${DRIVE_API}/about?fields=storageQuota`,
  );
  return about.storageQuota;
}
