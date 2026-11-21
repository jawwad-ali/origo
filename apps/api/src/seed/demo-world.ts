import { type CreateProductInput } from "@origo/shared";

/**
 * The demo world: real products and batches moved through the real services, so every pack has a
 * valid hash chain. Batch numbers double as markers: if the first one exists, the world is seeded.
 */
export const DEMO_MARKER_BATCH = "AUG-2026-0101";

export const DEMO_ORG_EMAILS = {
  manufacturer: "manufacturer@demo.origo.dev",
  distributor: "distributor@demo.origo.dev",
  wholesaler: "wholesaler@demo.origo.dev",
  pharmacy: "pharmacy@demo.origo.dev",
} as const;

export type DemoRole = keyof typeof DEMO_ORG_EMAILS;

export interface DemoProduct {
  key: string;
  input: CreateProductInput;
  batch: { batchNumber: string; packCount: number; manufacturedDaysAgo: number; expiresInDays: number };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    key: "augmentin",
    input: {
      name: "Augmentin",
      genericName: "Amoxicillin + Clavulanic acid",
      strength: "625 mg",
      dosageForm: "TABLET",
      packSize: "14 tablets",
      storageInstructions: "Store below 25°C in the original pack. Protect from moisture.",
    },
    batch: { batchNumber: DEMO_MARKER_BATCH, packCount: 600, manufacturedDaysAgo: 40, expiresInDays: 700 },
  },
  {
    key: "brufen",
    input: {
      name: "Brufen",
      genericName: "Ibuprofen",
      strength: "400 mg",
      dosageForm: "TABLET",
      packSize: "30 tablets",
      storageInstructions: "Store below 30°C in a dry place.",
    },
    // Close to expiry, so the "expires soon" state shows up across the app.
    batch: { batchNumber: "BRF-2024-0930", packCount: 300, manufacturedDaysAgo: 650, expiresInDays: 45 },
  },
  {
    key: "ventolin",
    input: {
      name: "Ventolin Evohaler",
      genericName: "Salbutamol",
      strength: "100 mcg",
      dosageForm: "INHALER",
      packSize: "200 doses",
      storageInstructions: "Store below 30°C. Do not puncture or burn, even when empty.",
    },
    // Recalled after reaching a pharmacy, to show the recall warning on a patient scan.
    batch: { batchNumber: "VNT-2026-0215", packCount: 150, manufacturedDaysAgo: 60, expiresInDays: 540 },
  },
  {
    key: "insulin",
    input: {
      name: "Humulin R",
      genericName: "Insulin human",
      strength: "100 IU/ml",
      dosageForm: "INJECTION",
      packSize: "10 ml vial",
      storageInstructions: "Store at 2–8°C. Do not freeze. Once opened, use within 28 days.",
    },
    batch: { batchNumber: "INS-2026-0301", packCount: 120, manufacturedDaysAgo: 25, expiresInDays: 400 },
  },
];

/** Cities used for the "copied label" scenario: the same code scanned far apart within hours. */
export const CLONE_SCAN_CITIES = [
  { city: "Lahore", country: "PK" },
  { city: "Karachi", country: "PK" },
  { city: "Peshawar", country: "PK" },
] as const;
