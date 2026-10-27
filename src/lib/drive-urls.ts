// Link công khai tới file Drive — dùng được cả ở client lẫn server.

export function drivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function driveThumbnailUrl(fileId: string, width = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

export function driveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?id=${fileId}&export=download`;
}
