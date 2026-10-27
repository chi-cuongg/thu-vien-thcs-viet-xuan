import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleCheck, CircleMinus, Lightbulb, SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SearchBox } from "@/components/search-box";
import { DongDangTai } from "@/components/ui";
import { demSachGiay, traCuuSachGiay } from "@/db/queries";

export const metadata: Metadata = { title: "Tra cứu sách giấy" };

const GOI_Y = [
  ["Tên sách", "Gõ vài chữ trong tên, ví dụ “dế mèn”"],
  ["Tác giả", "Ví dụ “Tô Hoài”, “Nguyễn Nhật Ánh”"],
  ["Số ĐKCB", "Số dán trên gáy sách, ví dụ “STK.01033”"],
];

async function KetQua({ tuKhoa }: { tuKhoa: string }) {
  const [ketQua, tong] = await Promise.all([tuKhoa ? traCuuSachGiay(tuKhoa) : Promise.resolve([]), demSachGiay()]);

  if (!tuKhoa) {
    return (
      <div className="the p-5 md:p-6">
        <p className="flex items-center gap-2 font-semibold">
          <Lightbulb className="size-5 text-accent" aria-hidden /> Có thể tìm theo
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {GOI_Y.map(([ten, vd]) => (
            <li key={ten} className="rounded-2xl bg-surface-muted p-4">
              <p className="font-medium">{ten}</p>
              <p className="mt-1 text-sm text-muted">{vd}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          {tong.banSach > 0
            ? `Kho hiện có ${tong.dauSach.toLocaleString("vi-VN")} đầu sách, ${tong.banSach.toLocaleString("vi-VN")} bản. `
            : "Thư viện đang nhập dữ liệu từ sổ đăng ký cá biệt. "}
          Tìm thấy sách còn trên giá thì ghi lại số ĐKCB và đưa cho thủ thư khi đến mượn.
        </p>
      </div>
    );
  }

  if (!ketQua.length) {
    return (
      <EmptyState icon={SearchX} title={`Không tìm thấy sách cho “${tuKhoa}”`}>
        Thử gõ ít chữ hơn, bỏ dấu, hoặc tìm theo tên tác giả.
      </EmptyState>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted" role="status">
        <strong className="text-fg">{ketQua.length}</strong> đầu sách khớp “{tuKhoa}”
      </p>
      <ul className="divide-y divide-border overflow-hidden the">
        {ketQua.map((s) => {
          const con = s.conTrenGia > 0;
          return (
            <li key={s.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">
                  {s.ten}
                  {s.tap && ` – ${s.tap}`}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {[s.tacGia, s.nhaXb, s.noiXb, s.namXb, s.monLoai && `Môn loại ${s.monLoai}`].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Số ĐKCB: <span className="font-mono text-fg [overflow-wrap:anywhere]">{s.dsDkcb.join(", ")}</span>
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1 text-sm font-medium md:self-auto ${
                  con ? "bg-success-soft text-success" : "bg-surface-muted text-muted"
                }`}
              >
                {con ? <CircleCheck className="size-4" aria-hidden /> : <CircleMinus className="size-4" aria-hidden />}
                {con ? `Còn ${s.conTrenGia}/${s.soBan} bản trên giá` : `Đã mượn hết (${s.soBan} bản)`}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

async function TraCuu({ searchParams }: Pick<PageProps<"/tra-cuu">, "searchParams">) {
  const { q } = await searchParams;
  const tuKhoa = ((Array.isArray(q) ? q[0] : q)?.trim() ?? "").slice(0, 100);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <SearchBox id="q-tra-cuu" action="/tra-cuu" defaultValue={tuKhoa} placeholder="Tên sách, tác giả, số ĐKCB…" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense key={tuKhoa} fallback={<DongDangTai />}>
          <KetQua tuKhoa={tuKhoa} />
        </Suspense>
      </div>
    </>
  );
}

export default function TraCuuPage({ searchParams }: PageProps<"/tra-cuu">) {
  return (
    <>
      <PageHeader
        title="Tra cứu sách giấy"
        description="Tìm sách có trong kho của thư viện, xem còn bao nhiêu bản trên giá để đến mượn."
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="h-13 animate-pulse rounded-full bg-surface-muted" />
          </div>
        }
      >
        <TraCuu searchParams={searchParams} />
      </Suspense>
    </>
  );
}
