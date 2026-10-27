import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2 text-muted">Trang bạn tìm có thể đã được chuyển hoặc chưa tồn tại.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg">
        Về trang chủ
      </Link>
    </div>
  );
}
