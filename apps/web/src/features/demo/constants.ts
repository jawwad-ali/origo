import { type VerificationVerdict } from "@origo/shared";
import { type StatusTone } from "@/components/status/status-pill";

export interface DemoAccount {
  role: string;
  email: string;
  organization: string;
  tryThis: string;
}

/** The seeded demo organizations (apps/api/prisma/seed.ts) and what's worth trying as each. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "Manufacturer",
    email: "manufacturer@demo.origo.dev",
    organization: "Talvane Pharmaceuticals",
    tryThis: "Register a batch and print its QR labels.",
  },
  {
    role: "Distributor",
    email: "distributor@demo.origo.dev",
    organization: "Seravan Distribution",
    tryThis: "Accept the pending Ibuvant delivery, then ship onward.",
  },
  {
    role: "Wholesaler",
    email: "wholesaler@demo.origo.dev",
    organization: "Kestora Wholesale",
    tryThis: "Review the insulin transfer waiting for you.",
  },
  {
    role: "Pharmacy",
    email: "pharmacy@demo.origo.dev",
    organization: "Halvern Community Pharmacy",
    tryThis: "Open a pack's timeline and dispense it to a patient.",
  },
  {
    role: "Platform admin",
    email: "admin@origo.local",
    organization: "Origo",
    tryThis: "Approve the pharmacy waiting for review.",
  },
];

export const EXPECTED_TONE: Record<VerificationVerdict, StatusTone> = {
  VERIFIED: "success",
  WARNING: "warning",
  NOT_RECOGNIZED: "danger",
};

export const EXPECTED_LABEL: Record<VerificationVerdict, string> = {
  VERIFIED: "Genuine",
  WARNING: "Warning",
  NOT_RECOGNIZED: "Not recognized",
};
