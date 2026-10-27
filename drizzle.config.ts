import { defineConfig } from "drizzle-kit";

// drizzle-kit không tự đọc .env.local như Next.js
try {
  process.loadEnvFile(".env.local");
} catch {
  // không có .env.local (ví dụ trên CI) — dùng biến môi trường sẵn có
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
