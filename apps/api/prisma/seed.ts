import { type OrgStatus, type OrgType, PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { z } from "zod";

/**
 * Idempotent seed: a platform admin plus one demo organization per supply-chain role,
 * so the app can be tried end to end without signing up. Safe to run more than once.
 */

const seedEnv = z
  .object({
    SEED_ADMIN_EMAIL: z.email(),
    SEED_ADMIN_PASSWORD: z.string().min(10),
    SEED_DEMO_PASSWORD: z.string().min(10),
  })
  .parse(process.env);

interface DemoOrg {
  email: string;
  fullName: string;
  org: {
    name: string;
    type: OrgType;
    status: OrgStatus;
    licenseNumber: string;
    city: string;
    country: string;
  };
}

const DEMO_ORGS: DemoOrg[] = [
  {
    email: "manufacturer@demo.origo.dev",
    fullName: "Sana Qureshi",
    org: {
      name: "Indus Pharmaceuticals",
      type: "MANUFACTURER",
      status: "APPROVED",
      licenseNumber: "DML-000417",
      city: "Karachi",
      country: "PK",
    },
  },
  {
    email: "distributor@demo.origo.dev",
    fullName: "Omar Farooq",
    org: {
      name: "Crescent Medical Distribution",
      type: "DISTRIBUTOR",
      status: "APPROVED",
      licenseNumber: "DDL-002291",
      city: "Lahore",
      country: "PK",
    },
  },
  {
    email: "wholesaler@demo.origo.dev",
    fullName: "Hina Raza",
    org: {
      name: "Ravi Pharma Wholesale",
      type: "WHOLESALER",
      status: "APPROVED",
      licenseNumber: "WSL-008830",
      city: "Faisalabad",
      country: "PK",
    },
  },
  {
    email: "pharmacy@demo.origo.dev",
    fullName: "Bilal Ahmed",
    org: {
      name: "Shifa Community Pharmacy",
      type: "PHARMACY",
      status: "APPROVED",
      licenseNumber: "PHL-015562",
      city: "Islamabad",
      country: "PK",
    },
  },
  {
    email: "pending@demo.origo.dev",
    fullName: "Ayesha Siddiqui",
    org: {
      name: "Northern Care Pharmacy",
      type: "PHARMACY",
      status: "PENDING",
      licenseNumber: "PHL-019004",
      city: "Peshawar",
      country: "PK",
    },
  },
];

const HASH_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

const prisma = new PrismaClient();

const seedAdmin = async (): Promise<string> => {
  const passwordHash = await argon2.hash(seedEnv.SEED_ADMIN_PASSWORD, HASH_OPTIONS);
  const admin = await prisma.user.upsert({
    where: { email: seedEnv.SEED_ADMIN_EMAIL },
    update: { isPlatformAdmin: true },
    create: {
      email: seedEnv.SEED_ADMIN_EMAIL,
      fullName: "Platform Admin",
      passwordHash,
      isPlatformAdmin: true,
    },
  });
  return admin.id;
};

const seedDemoOrg = async (demo: DemoOrg, passwordHash: string, adminId: string): Promise<void> => {
  const reviewed = demo.org.status === "APPROVED";
  const org = await prisma.organization.upsert({
    where: { country_licenseNumber: { country: demo.org.country, licenseNumber: demo.org.licenseNumber } },
    update: {},
    create: { ...demo.org, ...(reviewed ? { reviewedAt: new Date(), reviewedById: adminId } : {}) },
  });
  await prisma.user.upsert({
    where: { email: demo.email },
    update: {},
    create: {
      email: demo.email,
      fullName: demo.fullName,
      passwordHash,
      membership: { create: { organizationId: org.id, role: "OWNER" } },
    },
  });
};

const main = async (): Promise<void> => {
  const adminId = await seedAdmin();
  const demoHash = await argon2.hash(seedEnv.SEED_DEMO_PASSWORD, HASH_OPTIONS);
  for (const demo of DEMO_ORGS) {
    await seedDemoOrg(demo, demoHash, adminId);
  }
  process.stdout.write(
    `Seeded admin ${seedEnv.SEED_ADMIN_EMAIL} and ${DEMO_ORGS.length} demo organizations.\n`,
  );
};

main()
  .catch((error: unknown) => {
    process.stderr.write(`Seed failed: ${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
