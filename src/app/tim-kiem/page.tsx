import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ResourceGrid } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { ChipLoc, LuoiDangTai, NUT_CHINH, NUT_PHU } from "@/components/ui";
import { KHOI_LOP } from "@/config/taxonomy";
import { timTaiLieu } from "@/db/queries";

export const metadata: Metadata = { title: "Tìm kiếm" };

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function duongDan(q: string, khoi?: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (khoi) params.set("khoi", String(khoi));
  const s = params.toString();
  return s ? `/tim-kiem?${s}` : "/tim-kiem";
}

async function KetQua({ q, khoi }: { q: string; khoi?: number }) {
  const items = q || khoi ? await timTaiLieu(q, khoi) : [];

  if (items.length) {
    return (
      <>
        <p className="mb-4 text-sm text-muted" role="status">
          <strong className="text-fg">{items.length}</strong> kết quả{q && ` cho “${q}”`}
          {khoi && ` · lớp ${khoi}`}
        </p>
        <ResourceGrid items={items} />
      </>
    );
  }

  if (!q && !khoi) {
    return (
      <EmptyState title="Bạn muốn tìm gì?">
        Gõ tên sách, tên tác giả hoặc chủ đề vào ô phía trên — có dấu hay không dấu đều được. Có thể chọn khối lớp để thu hẹp
        kết quả.
      </EmptyState>
    );
  }

  return (
    <EmptyState
      icon={SearchX}
      title="Chưa có kết quả"
      actions={
        <>
          {q && khoi && (
            <Link href={duongDan(q)} className={NUT_CHINH}>
              Tìm “{q}” ở mọi lớp
            </Link>
          )}
          <Link href="/danh-muc" className={NUT_PHU}>
            Duyệt theo danh mục
          </Link>
          {q && (
            <Link href={`/tra-cuu?q=${encodeURIComponent(q)}`} className={NUT_PHU}>
              Tìm trong sách giấy
            </Link>
          )}
        </>
      }
    >
      {q ? (
        <>
          Không tìm thấy tài liệu nào cho “{q}”{khoi && ` trong lớp ${khoi}`}. Thử từ khoá ngắn hơn hoặc kiểm tra lại chính tả.
        </>
      ) : (
        <>Thư viện đang cập nhật tài liệu lớp {khoi}.</>
      )}
    </EmptyState>
  );
}

async function TimKiem({ searchParams }: Pick<PageProps<"/tim-kiem">, "searchParams">) {
  const params = await searchParams;
  const q = firstValue(params.q).slice(0, 100);
  const khoiSo = Number(firstValue(params.khoi));
  const khoi = (KHOI_LOP as readonly number[]).includes(khoiSo) ? khoiSo : undefined;

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-6">
        <SearchBox defaultValue={q} giuLai={{ khoi }} />
        <ChipLoc
          muc={[undefined, ...KHOI_LOP].map((k) => ({
            href: duongDan(q, k),
            nhan: k ? `Lớp ${k}` : "Mọi lớp",
            dangChon: k === khoi,
          }))}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense key={`${q}|${khoi}`} fallback={<LuoiDangTai />}>
          <KetQua q={q} khoi={khoi} />
        </Suspense>
      </div>
    </>
  );
}

export default function TimKiemPage({ searchParams }: PageProps<"/tim-kiem">) {
  return (
    <>
      <PageHeader title="Tìm kiếm tài liệu" description="Tìm theo tên sách, tác giả, chủ đề — gõ có dấu hay không dấu đều được." />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="h-12 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        }
      >
        <TimKiem searchParams={searchParams} />
      </Suspense>
    </>
  );
}
