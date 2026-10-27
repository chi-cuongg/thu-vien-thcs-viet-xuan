"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { doiVaiTro } from "@/app/quan-tri/nguoi-dung-actions";
import { TEN_VAI_TRO } from "@/config/vai-tro";
import type { VaiTro } from "@/db/schema";

export function VaiTroSelect({ userId, vaiTro, khoa }: { userId: string; vaiTro: VaiTro; khoa?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Vai trò"
      defaultValue={vaiTro}
      disabled={pending || khoa}
      onChange={(e) => {
        const value = e.target.value as VaiTro;
        startTransition(async () => {
          const ketQua = await doiVaiTro(userId, value);
          if (!ketQua.ok) window.alert(ketQua.error);
          router.refresh();
        });
      }}
      className="rounded-md border border-border bg-surface px-2 py-1 text-sm disabled:opacity-60"
    >
      {(Object.keys(TEN_VAI_TRO) as VaiTro[]).map((v) => (
        <option key={v} value={v}>
          {TEN_VAI_TRO[v]}
        </option>
      ))}
    </select>
  );
}
