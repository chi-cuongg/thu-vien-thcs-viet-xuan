"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { duyetTaiLieu, type KetQua, tuChoiTaiLieu, xoaTaiLieu } from "@/app/quan-tri/tai-lieu-actions";

export function NutTaiLieu({ id, trangThai, laThuThu }: { id: number; trangThai: string; laThuThu: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function chay(action: () => Promise<KetQua>) {
    startTransition(async () => {
      const ketQua = await action();
      if (!ketQua.ok) window.alert(ketQua.error);
      router.refresh();
    });
  }

  const nut = "inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-50";
  return (
    <div className="flex shrink-0 flex-wrap gap-2" aria-busy={pending}>
      {laThuThu && trangThai !== "da_duyet" && (
        <button type="button" disabled={pending} onClick={() => chay(() => duyetTaiLieu(id))} className={`${nut} border-primary bg-primary text-primary-fg hover:opacity-90`}>
          Duyệt
        </button>
      )}
      {laThuThu && trangThai === "cho_duyet" && (
        <button type="button" disabled={pending} onClick={() => chay(() => tuChoiTaiLieu(id))} className={`${nut} border-border hover:border-primary hover:text-primary`}>
          Từ chối
        </button>
      )}
      {(laThuThu || trangThai === "cho_duyet") && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Xoá tài liệu này? File trên Drive sẽ được đưa vào thùng rác.")) chay(() => xoaTaiLieu(id));
          }}
          className={`${nut} border-transparent text-danger hover:border-danger hover:bg-danger-soft`}
        >
          Xoá
        </button>
      )}
    </div>
  );
}
