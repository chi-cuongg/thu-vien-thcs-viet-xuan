"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NUT_CHINH } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

// Nền ô nhập khác nền thẻ để nhìn rõ ô cả ở giao diện tối
const O_NHAP =
  "mt-1.5 block min-h-12 w-full rounded-2xl border-[1.5px] border-border bg-surface-muted px-4 text-base outline-none transition focus:border-primary focus:bg-surface";

/** Học sinh không có Gmail: đăng nhập bằng mã học sinh và mật khẩu thủ thư phát. */
export function MaHocSinhForm({ tiep }: { tiep: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function dangNhap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.username({
      username: String(form.get("ma") ?? "").trim(),
      password: String(form.get("mat-khau") ?? ""),
    });
    if (error) {
      setError(
        error.status === 429
          ? "Thử sai quá nhiều lần. Đợi một lát rồi thử lại."
          : "Sai mã học sinh hoặc mật khẩu. Kiểm tra lại, hoặc nhờ thủ thư cấp lại mật khẩu.",
      );
      setPending(false);
      return;
    }
    router.push(tiep);
    router.refresh();
  }

  return (
    <form onSubmit={dangNhap} className="space-y-4">
      <div>
        <label htmlFor="ma" className="text-sm font-bold">
          Mã học sinh
        </label>
        <input
          id="ma"
          name="ma"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={O_NHAP}
        />
      </div>
      <div>
        <label htmlFor="mat-khau" className="text-sm font-bold">
          Mật khẩu
        </label>
        <input
          id="mat-khau"
          name="mat-khau"
          type="password"
          required
          autoComplete="current-password"
          className={O_NHAP}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${NUT_CHINH} w-full`}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}

export function GoogleSignInButton({ tiep = "/tai-khoan" }: { tiep?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: tiep });
    if (error) {
      setError(error.message ?? "Không đăng nhập được, thử lại sau.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="flex min-h-13 w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-border bg-surface px-5 font-bold shadow-clay transition hover:-translate-y-0.5 hover:border-primary active:translate-y-0.5 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
        </svg>
        {pending ? "Đang chuyển tới Google…" : "Đăng nhập bằng Google"}
      </button>
      {error && (
        <p role="alert" className="mt-3 rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className="inline-flex min-h-10 items-center rounded-full border-[1.5px] border-border px-4 text-sm font-bold transition hover:border-danger hover:text-danger"
    >
      Đăng xuất
    </button>
  );
}
