"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { doiTinhTrangBanSach } from "@/app/quan-tri/so-dkcb-actions";

const TINH_TRANG = [
  { id: "tren_gia", ten: "Trên giá" },
  { id: "dang_muon", ten: "Đang mượn" },
  { id: "hong", ten: "Hỏng" },
  { id: "mat", ten: "Mất" },
  { id: "thanh_ly", ten: "Thanh lý" },
];

export function TinhTrangBanSach({ soDkcb, tinhTrang }: { soDkcb: string; tinhTrang: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label={`Tình trạng ${soDkcb}`}
      defaultValue={tinhTrang}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(async () => {
          const ketQua = await doiTinhTrangBanSach(soDkcb, value);
          if (!ketQua.ok) window.alert(ketQua.error);
          router.refresh();
        });
      }}
      className="min-h-9 rounded-lg border border-border bg-surface px-2 text-sm disabled:opacity-50"
    >
      {TINH_TRANG.map((t) => (
        <option key={t.id} value={t.id}>
          {t.ten}
        </option>
      ))}
    </select>
  );
}
