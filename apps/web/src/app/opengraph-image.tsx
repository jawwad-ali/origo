import { ImageResponse } from "next/og";

export const alt = "Origo: every medicine pack, accounted for";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a2229";
const TEXT = "#e4eff2";
const MUTED = "#8eb0ba";
const ACCENT = "#5ec4da";

const STOPS = ["Manufacturer", "Distributor", "Wholesaler", "Pharmacy"];

/** The link preview shown when the app is shared: the product's promise and the supply-chain line. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: INK,
        color: TEXT,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            border: `6px solid ${TEXT}`,
            display: "flex",
          }}
        />
        <div style={{ fontSize: 40, fontWeight: 700 }}>Origo</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>Every pack, accounted for.</div>
        <div style={{ fontSize: 30, color: MUTED, maxWidth: 900 }}>
          Signed QR codes and a tamper-evident history for every medicine pack, from factory to patient.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {STOPS.map((stop, index) => (
          <div key={stop} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 999, background: ACCENT }} />
              <div style={{ fontSize: 24, color: TEXT }}>{stop}</div>
            </div>
            {index < STOPS.length - 1 ? (
              <div style={{ width: 120, height: 3, background: ACCENT, margin: "0 24px 34px 24px" }} />
            ) : null}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
