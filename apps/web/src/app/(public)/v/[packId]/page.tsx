import type { Metadata } from "next";
import Link from "next/link";
import { JourneySummary } from "@/features/verify/components/journey-summary";
import { PackFacts } from "@/features/verify/components/pack-facts";
import { VerdictPanel } from "@/features/verify/components/verdict-panel";
import { verifyPack } from "@/features/verify/services/verify.server";

export const metadata: Metadata = { title: "Medicine check" };

interface PageProps {
  params: Promise<{ packId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const single = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const TIME = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function VerifyPage({ params, searchParams }: PageProps) {
  const [{ packId }, query] = await Promise.all([params, searchParams]);
  const result = await verifyPack(decodeURIComponent(packId), single(query.k), single(query.s));

  return (
    <div className="space-y-4">
      <VerdictPanel result={result} />
      {result.pack ? (
        <>
          <PackFacts pack={result.pack} />
          <JourneySummary pack={result.pack} />
        </>
      ) : (
        <section className="bg-card space-y-2 rounded-2xl border p-5 text-sm sm:p-6">
          <h2 className="text-base font-semibold">What to do</h2>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 leading-relaxed">
            <li>Make sure you scanned the Origo code printed on the pack, not another barcode.</li>
            <li>Show the pack to a pharmacist before taking it.</li>
            <li>If you bought it online or from a market stall, report it to your drug regulator.</li>
          </ul>
        </section>
      )}
      <p className="text-muted-foreground flex flex-wrap justify-between gap-2 px-1 text-xs">
        <span className="font-mono">{result.publicId}</span>
        <span>Checked {TIME.format(new Date(result.checkedAt))}</span>
      </p>
      <p className="px-1 text-xs">
        <Link href="/verify" className="text-primary underline-offset-4 hover:underline">
          Check another pack
        </Link>
      </p>
    </div>
  );
}
