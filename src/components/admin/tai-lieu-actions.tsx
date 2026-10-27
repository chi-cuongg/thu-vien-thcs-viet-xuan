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

  const nut = "rounded-md border px-2.5 py-1 text-sm font-medium disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-2">
      {laThuThu && trangThai !== "da_duyet" && (
        <button type="button" disabled={pending} onClick={() => chay(() => duyetTaiLieu(id))} className={`${nut} border-primary bg-primary text-primary-fg`}>
          Duyệt
        </button>
      )}
      {laThuThu && trangThai === "cho_duyet" && (
        <button type="button" disabled={pending} onClick={() => chay(() => tuChoiTaiLieu(id))} className={`${nut} border-border hover:bg-surface-muted`}>
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
          className={`${nut} border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950`}
        >
          Xoá
        </button>
      )}
    </div>
  );
}
