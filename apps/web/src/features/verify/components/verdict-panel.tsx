import { type VerificationDto } from "@origo/shared";
import { cn } from "@/lib/utils";
import { VERDICT_COPY } from "../constants";

/** The answer, first and largest: what the patient came to find out. */
export const VerdictPanel = ({ result }: { result: VerificationDto }) => {
  const copy = VERDICT_COPY[result.verdict];
  const Icon = copy.icon;
  const summary =
    result.verdict === "VERIFIED" && result.pack
      ? `Registered by ${result.pack.manufacturer.name}${
          result.pack.journey.reachedPharmacyOn ? " and supplied through a licensed pharmacy" : ""
        }. Every handover is on record.`
      : copy.summary;

  return (
    <section
      className={cn("rounded-2xl border p-5 sm:p-6", copy.panel)}
      aria-live="polite"
      aria-labelledby="verdict"
    >
      <div className="flex items-start gap-4">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", copy.iconWrap)}>
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <h1 id="verdict" className="text-balance text-2xl font-semibold tracking-tight">
            {copy.title}
          </h1>
          <p className="text-foreground/80 text-sm leading-relaxed">{summary}</p>
        </div>
      </div>

      {result.reasons.length > 0 ? (
        <ul className="border-foreground/10 mt-5 space-y-3 border-t pt-4">
          {result.reasons.map((reason) => (
            <li key={reason.code} className="text-sm">
              <p className="font-medium">{reason.title}</p>
              <p className="text-foreground/75 leading-relaxed">{reason.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};
