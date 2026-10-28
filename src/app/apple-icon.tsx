import { ImageResponse } from "next/og";
import { OgLogo } from "@/components/og-logo";

// Biểu tượng khi thêm website ra màn hình chính iPhone/iPad (iOS tự bo góc nên để vuông, tràn viền)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<OgLogo size={180} radius={0} />, size);
}
