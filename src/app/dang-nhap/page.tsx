import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Library } from "lucide-react";
import { GoogleSignInButton, MaHocSinhForm } from "@/components/auth-buttons";
import { SITE } from "@/config/site";
import { getSession, tiepHopLe } from "@/lib/session";

export const metadata: Metadata = { title: "Đăng nhập" };

async function KhungDangNhap({ searchParams }: Pick<PageProps<"/dang-nhap">, "searchParams">) {
  const tiep = tiepHopLe((await searchParams).tiep) ?? "/tai-khoan";
  // Đã đăng nhập thì đi tiếp luôn
  if (await getSession()) redirect(tiep);

  return (
    <>
      <section aria-labelledby="hoc-sinh" className="mt-6">
        <h2 id="hoc-sinh" className="text-lg font-bold">
          Học sinh
        </h2>
        <p className="mt-1 text-sm text-muted">Dùng mã học sinh và mật khẩu thủ thư phát cho em.</p>
        <div className="mt-4">
          <MaHocSinhForm tiep={tiep} />
        </div>
      </section>

      <p className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        hoặc
      </p>

      <section aria-labelledby="google">
        <h2 id="google" className="text-lg font-bold">
          Thầy cô, thủ thư · học sinh có Gmail
        </h2>
        <div className="mt-4">
          <GoogleSignInButton tiep={tiep} />
        </div>
      </section>
    </>
  );
}

export default function DangNhapPage({ searchParams }: PageProps<"/dang-nhap">) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="the p-6 shadow-clay-lg md:p-8">
        <span className="grid size-14 -rotate-3 place-items-center rounded-2xl bg-gradient-to-br from-primary to-tone-violet text-primary-fg shadow-nut">
          <Library className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-muted">
          Đăng nhập để đặt mượn sách giấy của {SITE.shortName}. Đọc sách điện tử và tra cứu thì không cần đăng nhập.
        </p>
        <Suspense fallback={<div className="mt-6 h-72 animate-pulse rounded-3xl bg-surface-muted" />}>
          <KhungDangNhap searchParams={searchParams} />
        </Suspense>
      </div>
      <Link href="/" className="mt-6 inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-muted transition hover:bg-surface hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Về trang chủ
      </Link>
    </div>
  );
}
