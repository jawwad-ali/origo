/**
 * Label sheet geometry, in PDF points (1 mm = 2.8346 pt).
 * Matches the common A4 21-up sheet (Avery L7160 / J8160): 3 columns x 7 rows of 63.5 x 38.1 mm labels,
 * so files print straight onto stock label paper.
 */
const MM = 2.834645669;

export const SHEET = {
  width: 210 * MM,
  height: 297 * MM,
  columns: 3,
  rows: 7,
  labelWidth: 63.5 * MM,
  labelHeight: 38.1 * MM,
  marginLeft: 7.2 * MM,
  marginTop: 15.1 * MM,
  columnPitch: 66 * MM,
  rowPitch: 38.1 * MM,
} as const;

export const LABELS_PER_SHEET = SHEET.columns * SHEET.rows;

export const LABEL = {
  padding: 2.5 * MM,
  qrSize: 27 * MM,
  gap: 2.5 * MM,
} as const;

export const COLORS = {
  ink: "#0f1d24",
  muted: "#5a6a72",
  brand: "#155e75",
} as const;

export const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  mono: "Courier",
  monoBold: "Courier-Bold",
} as const;

/** Top-left corner of the label at `index` on its sheet. */
export const labelOrigin = (index: number): { x: number; y: number } => {
  const slot = index % LABELS_PER_SHEET;
  const column = slot % SHEET.columns;
  const row = Math.floor(slot / SHEET.columns);
  return { x: SHEET.marginLeft + column * SHEET.columnPitch, y: SHEET.marginTop + row * SHEET.rowPitch };
};
