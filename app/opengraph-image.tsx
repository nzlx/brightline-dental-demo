import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero, site } from "@/content";

export const alt = `${site.name}: ${hero.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [font, photo] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/plus-jakarta-sans-latin-800-normal.woff")),
    readFile(join(process.cwd(), "public/images/hero-smile.jpg")),
  ]);
  const img = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #e8f4f9 60%, #e2f5f2 100%)",
          padding: "0 64px",
          color: "#0f2a3d",
          fontFamily: "Jakarta",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: "#0b7c78" }} />
            <div style={{ display: "flex", fontSize: 30 }}>Brightline Family Dental</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 36, fontSize: 64, lineHeight: 1.08, letterSpacing: -2 }}>
            <span>The dentist your family</span>
            <span style={{ display: "flex" }}>
              actually&nbsp;
              <span style={{ background: "#ffe27a", padding: "0 8px", borderRadius: 8 }}>looks forward to.</span>
            </span>
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 26, color: "#546779" }}>
            South Austin, TX · Same-day emergencies · Book online
          </div>
        </div>
        <div style={{ display: "flex", width: 380, height: 460, borderRadius: 32, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" width={380} height={460} style={{ objectFit: "cover", width: 380, height: 460 }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Jakarta", data: font, weight: 800, style: "normal" }] },
  );
}
