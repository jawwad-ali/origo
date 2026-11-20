export const COUNTRY_OPTIONS = [
  { code: "PK", name: "Pakistan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "OM", name: "Oman" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
] as const;

export const DEFAULT_COUNTRY = "PK";

/** The sample pack shown beside the auth forms. Illustrative, not real data. */
export const SAMPLE_PACK = {
  id: "MED-2026-000123",
  verifyUrl: "https://origo.app/v/MED-2026-000123",
  maker: "Indus Pharmaceuticals",
  drug: "Paracetamol",
  strength: "500 mg",
  form: "20 tablets · Oral",
  batch: "PCM-2026-0412",
  expiry: "03/2028",
  storage: "Store below 25°C",
} as const;

export const SAMPLE_ROUTE = [
  { role: "Manufacturer", city: "Karachi", date: "12 Mar" },
  { role: "Distributor", city: "Lahore", date: "14 Mar" },
  { role: "Wholesaler", city: "Faisalabad", date: "17 Mar" },
  { role: "Pharmacy", city: "Islamabad", date: "19 Mar" },
] as const;

export const SAMPLE_VERDICT = "Verified at Shifa Community Pharmacy";
