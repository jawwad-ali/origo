import { type DemoSampleDto } from "@origo/shared";
import { ArrowUpRight, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "@/components/status/status-pill";
import { qrSvg } from "@/lib/qr/qr-svg";
import { EXPECTED_LABEL, EXPECTED_TONE } from "../constants";

const ICONS = { VERIFIED: ShieldCheck, WARNING: ShieldAlert, NOT_RECOGNIZED: ShieldQuestion } as const;

/** A real demo pack's signed QR. Scan it with a phone, or open the result here. */
export const SampleCard = async ({ sample }: { sample: DemoSampleDto }) => {
  const qr = await qrSvg(sample.verifyUrl);
  const url = new URL(sample.verifyUrl);

  return (
    <article className="bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{sample.title}</h3>
          <p className="text-muted-foreground text-sm">{sample.description}</p>
        </div>
        <StatusPill tone={EXPECTED_TONE[sample.expected]} icon={ICONS[sample.expected]} className="shrink-0">
          {EXPECTED_LABEL[sample.expected]}
        </StatusPill>
      </div>
      <div className="mt-auto flex items-end justify-between gap-4">
        {/* Generated on the server from the API's signed URL; no user input reaches this markup. */}
        <div
          className="size-28 shrink-0 rounded-md border bg-white p-2 [&_svg]:size-full"
          role="img"
          aria-label={`QR code for sample pack ${sample.publicId}`}
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <div className="min-w-0 space-y-2 text-right">
          <p className="text-muted-foreground font-mono text-xs">{sample.publicId}</p>
          <Link
            href={`${url.pathname}${url.search}`}
            className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            Open result
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};
