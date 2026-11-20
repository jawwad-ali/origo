import { type VerificationDto } from "@origo/shared";
import { Check } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type PackView = NonNullable<VerificationDto["pack"]>;

interface Step {
  label: string;
  detail: string | null;
  done: boolean;
}

const stepsFor = (pack: PackView): Step[] => [
  { label: "Registered by the manufacturer", detail: formatDate(pack.journey.registeredOn), done: true },
  {
    label:
      pack.journey.handovers === 0
        ? "Not handed on yet"
        : `${pack.journey.handovers} recorded ${pack.journey.handovers === 1 ? "handover" : "handovers"}`,
    detail: null,
    done: pack.journey.handovers > 0,
  },
  {
    label: "Reached a licensed pharmacy",
    detail: pack.journey.reachedPharmacyOn ? formatDate(pack.journey.reachedPharmacyOn) : null,
    done: Boolean(pack.journey.reachedPharmacyOn),
  },
  {
    label: "Sold to a patient",
    detail: pack.journey.dispensedOn ? formatDate(pack.journey.dispensedOn) : null,
    done: Boolean(pack.journey.dispensedOn),
  },
];

/** The supply chain in four plain steps. Names of distributors and pharmacies stay private. */
export const JourneySummary = ({ pack }: { pack: PackView }) => (
  <section className="bg-card rounded-2xl border p-5 sm:p-6" aria-labelledby="journey">
    <h2 id="journey" className="mb-4 text-base font-semibold">
      Where this pack has been
    </h2>
    <ol className="space-y-3">
      {stepsFor(pack).map((step) => (
        <li key={step.label} className="flex items-center gap-3 text-sm">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border",
              step.done ? "bg-primary border-primary text-primary-foreground" : "border-border",
            )}
            aria-hidden="true"
          >
            {step.done ? <Check className="size-3.5" /> : null}
          </span>
          <span className={cn("flex-1", !step.done && "text-muted-foreground")}>
            {step.label}
            <span className="sr-only">{step.done ? " (done)" : " (not yet)"}</span>
          </span>
          {step.detail ? <span className="tabular text-muted-foreground text-xs">{step.detail}</span> : null}
        </li>
      ))}
    </ol>
    {pack.scans.total > 0 && pack.scans.firstScannedAt ? (
      <p className="text-muted-foreground mt-4 border-t pt-3 text-xs">
        This code has been checked {pack.scans.total} {pack.scans.total === 1 ? "time" : "times"} since{" "}
        {formatDate(pack.scans.firstScannedAt)}.
      </p>
    ) : null}
  </section>
);
