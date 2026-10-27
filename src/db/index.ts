import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Driver HTTP của Neon: mỗi truy vấn là một request, hợp với serverless trên Vercel và DB scale-to-zero.
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Thiếu biến môi trường DATABASE_URL");
  return drizzle(neon(url), { schema });
}

let instance: ReturnType<typeof createDb> | undefined;

/** Kết nối được tạo khi dùng lần đầu, để build không cần DATABASE_URL. */
export function getDb() {
  instance ??= createDb();
  return instance;
}
