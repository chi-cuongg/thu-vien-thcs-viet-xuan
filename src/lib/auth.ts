import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

// Email được tự cấp quyền admin khi đăng nhập lần đầu, ví dụ ADMIN_EMAILS=thuvien@gmail.com,hieutruong@gmail.com
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name}`);
  return value;
}

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    // Chỉ đăng nhập bằng Google — dùng chung OAuth client với kho Drive
    socialProviders: {
      google: {
        clientId: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
        clientSecret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
        prompt: "select_account",
      },
    },
    user: {
      additionalFields: {
        role: {
          type: ["admin", "thu_thu", "giao_vien", "nguoi_dung"],
          required: false,
          defaultValue: "nguoi_dung",
          input: false, // người dùng không tự đặt quyền được
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!adminEmails().includes(user.email.toLowerCase())) return;
            return { data: { ...user, role: "admin" } };
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Khởi tạo khi dùng lần đầu, để build không cần DATABASE_URL hay key Google. */
export function getAuth() {
  instance ??= createAuth();
  return instance;
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
