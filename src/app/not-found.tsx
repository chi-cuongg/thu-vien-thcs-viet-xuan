import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { NUT_CHINH, NUT_PHU } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-6xl font-bold text-primary/30">404</p>
      <h1 className="mt-2 text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2 text-muted">Trang bạn tìm có thể đã được chuyển hoặc chưa tồn tại. Thử tìm tài liệu bạn cần:</p>
      <div className="mt-6 text-left">
        <SearchBox id="q-404" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={NUT_CHINH}>
          Về trang chủ
        </Link>
        <Link href="/danh-muc" className={NUT_PHU}>
          Xem danh mục
        </Link>
      </div>
    </div>
  );
}
