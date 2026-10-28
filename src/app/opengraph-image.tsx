import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OgLogo } from "@/components/og-logo";
import { SITE } from "@/config/site";

// Ảnh xem trước khi gửi link qua Zalo, Facebook, Messenger… — sinh lúc build, dùng chung cho mọi trang
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Màu các gáy sách, giống hình minh hoạ "Mượn sách giấy" ở trang chủ
const GAY_SACH = [
  { mau: "#3b82f6", cao: 230 },
  { mau: "#fb923c", cao: 180 },
  { mau: "#facc15", cao: 260 },
  { mau: "#34d399", cao: 205 },
  { mau: "#a78bfa", cao: 240 },
  { mau: "#f472b6", cao: 170 },
];

const CHU_DE = ["Sách điện tử", "Bài giảng", "Đề thi", "Mượn sách giấy"];

export default async function OpengraphImage() {
  const fontDir = join(process.cwd(), "src/assets/fonts");
  const [baloo, nunito] = await Promise.all([
    readFile(join(fontDir, "Baloo2-ExtraBold.ttf")),
    readFile(join(fontDir, "Nunito-Bold.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #e4edff 0%, #f4f7ff 50%, #ede9fe 100%)",
        fontFamily: "Nunito",
        color: "#1e293b",
      }}
    >
      <div style={{ position: "absolute", right: -120, top: -140, width: 420, height: 420, borderRadius: 999, background: "#fef3c7" }} />
      <div style={{ position: "absolute", left: 420, bottom: -220, width: 380, height: 380, borderRadius: 999, background: "#fce7f3" }} />

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 60px 72px", width: 780, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <OgLogo size={84} radius={24} />
          <div style={{ display: "flex", fontSize: 28, color: "#64748b" }}>Kho học liệu điện tử</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Baloo", fontSize: 58, lineHeight: 1.1, color: "#0f172a", whiteSpace: "nowrap" }}>
            Thư viện THCS Vĩnh Thành
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Baloo",
              fontSize: 64,
              lineHeight: 1.15,
              backgroundImage: "linear-gradient(90deg, #2563eb, #6d28d9)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Phân hiệu Việt Xuân
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: "#475569" }}>{SITE.address}</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {CHU_DE.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "#ffffff",
                fontSize: 24,
                color: "#2563eb",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 40 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "36px 30px 0",
            borderRadius: 40,
            background: "#ffffff",
            boxShadow: "0 24px 60px rgba(37, 99, 235, 0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 270 }}>
            {GAY_SACH.map((g) => (
              <div key={g.mau} style={{ width: 36, height: g.cao, borderRadius: 10, background: g.mau }} />
            ))}
          </div>
          <div style={{ width: 280, height: 14, borderRadius: 7, background: "#fde68a", marginBottom: 36 }} />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Baloo", data: baloo, weight: 800, style: "normal" },
        { name: "Nunito", data: nunito, weight: 700, style: "normal" },
      ],
    },
  );
}
