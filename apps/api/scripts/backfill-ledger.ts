import { PrismaClient } from "@prisma/client";
import { GENESIS_HASH, hashEvent } from "../src/modules/ledger/ledger-hash";

/**
 * One-off: gives packs registered before the ledger existed (Phase 2) their first REGISTERED event,
 * dated when the pack was created. Packs that already have history are skipped, so it's safe to rerun.
 *   pnpm --filter @origo/api ledger:backfill
 */
const PAGE_SIZE = 1000;
const prisma = new PrismaClient();

const main = async (): Promise<void> => {
  let total = 0;
  for (;;) {
    const packs = await prisma.pack.findMany({
      where: { ledgerEvents: { none: {} } },
      select: { id: true, createdAt: true, batch: { select: { organizationId: true, createdById: true } } },
      take: PAGE_SIZE,
    });
    if (packs.length === 0) break;

    await prisma.ledgerEvent.createMany({
      data: packs.map((pack) => {
        const fields = {
          packId: pack.id,
          seq: 1,
          type: "REGISTERED" as const,
          actorOrgId: pack.batch.organizationId,
          counterpartyOrgId: null,
          transferId: null,
          createdAt: pack.createdAt,
        };
        return {
          ...fields,
          actorUserId: pack.batch.createdById,
          prevHash: GENESIS_HASH,
          hash: hashEvent(GENESIS_HASH, fields),
        };
      }),
    });
    total += packs.length;
  }
  process.stdout.write(`Backfilled REGISTERED events for ${total} packs.\n`);
};

main()
  .catch((error: unknown) => {
    process.stderr.write(`Backfill failed: ${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
