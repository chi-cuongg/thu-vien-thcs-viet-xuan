import { desc, inArray, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NhapSoDkcb } from "@/components/admin/nhap-so-dkcb";
import { TinhTrangBanSach } from "@/components/admin/tinh-trang-ban-sach";
import { EmptyState } from "@/components/empty-state";
import { SearchBox } from "@/components/search-box";
import { getDb } from "@/db";
import { banSach, dauSach } from "@/db/schema";
import { requireRole, STAFF_ROLES } from "@/lib/session";

export const metadata: Metadata = { title: "Sổ đăng ký cá biệt" };

const TEN_NGUON: Record<string, string> = { mua: "Mua", cap_phat: "Cấp phát", tang: "Tặng" };

async function NoiDung({ searchParams }: Pick<PageProps<"/quan-tri/so-dkcb">, "searchParams">) {
  await requireRole(STAFF_ROLES);
  const { q } = await searchParams;
  const tuKhoa = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  const db = getDb();
  const [tongHop] = await db
    .select({
      dauSach: sql<number>`count(distinct ${banSach.dauSachId})::int`,
      banSach: sql<number>`count(*)::int`,
      tongGia: sql<number>`coalesce(sum(${banSach.gia}), 0)::bigint`,
      dangMuon: sql<number>`(count(*) filter (where ${banSach.tinhTrang} = 'dang_muon'))::int`,
    })
    .from(banSach);

  const timKiem = tuKhoa
    ? sql`(${dauSach.searchText} like '%' || vn_unaccent(${tuKhoa}) || '%'
         or ${dauSach.id} in (select dau_sach_id from ban_sach where upper(so_dkcb) like '%' || upper(${tuKhoa}) || '%'))`
    : undefined;
  const dsDauSach = await db
    .select()
    .from(dauSach)
    .where(timKiem)
    .orderBy(desc(dauSach.createdAt), dauSach.ten)
    .limit(50);
  const dsBan = dsDauSach.length
    ? await db
        .select()
        .from(banSach)
        .where(inArray(banSach.dauSachId, dsDauSach.map((d) => d.id)))
        .orderBy(banSach.soDkcb)
    : [];

  return (
    <>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Đầu sách", tongHop.dauSach.toLocaleString("vi-VN")],
          ["Bản sách", tongHop.banSach.toLocaleString("vi-VN")],
          ["Đang mượn", tongHop.dangMuon.toLocaleString("vi-VN")],
          ["Tổng giá trị", `${Number(tongHop.tongGia).toLocaleString("vi-VN")} đ`],
        ].map(([ten, giaTri]) => (
          <div key={ten} className="the p-4">
            <dt className="text-sm text-muted">{ten}</dt>
            <dd className="mt-1 text-2xl font-bold">{giaTri}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Nhập từ file</h2>
        <div className="mt-3">
          <NhapSoDkcb />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Sách trong kho</h2>
        <div className="mt-3 max-w-xl">
          <SearchBox id="q-so-dkcb" action="/quan-tri/so-dkcb" defaultValue={tuKhoa} placeholder="Tên sách, tác giả, số ĐKCB…" />
        </div>
        <div className="mt-4">
          {dsDauSach.length === 0 ? (
            <EmptyState title={tuKhoa ? "Không tìm thấy sách" : "Chưa có sách nào trong sổ"} />
          ) : (
            <ul className="divide-y divide-border the">
              {dsDauSach.map((d) => {
                const ban = dsBan.filter((b) => b.dauSachId === d.id);
                return (
                  <li key={d.id}>
                    <details>
                      <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-surface-muted">
                        <span>
                          <span className="font-semibold">
                            {d.ten}
                            {d.tap && ` – ${d.tap}`}
                          </span>
                          <span className="block text-sm text-muted">
                            {[d.tacGia, d.noiXb, d.namXb, d.monLoai].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <span className="text-sm text-muted">
                          {ban.length} bản · {ban.filter((b) => b.tinhTrang === "tren_gia").length} trên giá
                        </span>
                      </summary>
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-border border-t border-border">
                          {ban.map((b) => (
                            <tr key={b.id}>
                              <td className="px-4 py-2 font-mono">{b.soDkcb}</td>
                              <td className="px-2 py-2 text-muted">{TEN_NGUON[b.nguon]}</td>
                              <td className="px-2 py-2 text-right text-muted">{b.gia != null ? `${b.gia.toLocaleString("vi-VN")} đ` : ""}</td>
                              <td className="px-4 py-2 text-right">
                                <TinhTrangBanSach soDkcb={b.soDkcb} tinhTrang={b.tinhTrang} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default function SoDkcbPage({ searchParams }: PageProps<"/quan-tri/so-dkcb">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Sổ đăng ký cá biệt</h1>
      <p className="mt-1 text-sm text-muted">Nhập sổ từ Excel/CSV, tra cứu và cập nhật tình trạng từng bản sách.</p>
      <Suspense fallback={<div className="mt-6 h-64 the" aria-busy />}>
        <NoiDung searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
