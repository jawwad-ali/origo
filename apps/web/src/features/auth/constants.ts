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

/** The sample journey shown beside the auth forms. Illustrative, not real data. */
export const SAMPLE_JOURNEY = {
  packId: "MED-2026-000123",
  product: "Paracetamol 500 mg · Batch PCM-2026-0412",
  events: [
    { label: "Registered", actor: "Indus Pharmaceuticals", place: "Karachi", time: "12 Mar, 09:14" },
    { label: "Received", actor: "Crescent Medical Distribution", place: "Lahore", time: "14 Mar, 16:02" },
    { label: "Received", actor: "Ravi Pharma Wholesale", place: "Faisalabad", time: "17 Mar, 11:40" },
    { label: "Received", actor: "Shifa Community Pharmacy", place: "Islamabad", time: "19 Mar, 10:25" },
  ],
} as const;
