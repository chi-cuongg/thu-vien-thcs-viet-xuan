import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function supabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

function anonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Client theo phiên đăng nhập của người dùng (đọc cookie) — dùng trong Server Component,
 * Server Action, Route Handler. Gọi bên trong <Suspense> vì cookies() là runtime API.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), anonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Component không ghi được cookie; proxy sẽ làm mới phiên.
        }
      },
    },
  });
}

/** Client ẩn danh cho dữ liệu công khai — dùng được trong hàm "use cache" vì không đọc cookie. */
export function createPublicClient() {
  return createClient(supabaseUrl(), anonKey(), { auth: { persistSession: false } });
}
