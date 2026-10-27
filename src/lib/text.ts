/** Bỏ dấu tiếng Việt: "Đề thi Toán" → "De thi Toan" */
export function boDau(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Tạo slug cho URL: "Đề thi Toán 9 – HK1" → "de-thi-toan-9-hk1" */
export function slugify(input: string): string {
  return boDau(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
