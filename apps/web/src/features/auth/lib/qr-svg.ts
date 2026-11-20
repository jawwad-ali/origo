import "server-only";
import QRCode from "qrcode";

const QR_INK = "#0f1d24";
const QR_PAPER = "#00000000";

/** Renders a QR code as an inline SVG string on the server. Input is our own constant, never user text. */
export const qrSvg = (value: string): Promise<string> =>
  QRCode.toString(value, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: QR_INK, light: QR_PAPER },
  });
