import { ShieldCheck } from "lucide-react";
import { SAMPLE_JOURNEY } from "../constants";

/** A sample pack history beside the auth forms: shows what Origo records, using the product's own UI. */
export const JourneyPanel = () => (
  <div className="flex h-full flex-col justify-center gap-10 p-10 xl:p-14">
    <div className="max-w-md space-y-3">
      <h2 className="text-balance text-3xl font-semibold tracking-tight">Every pack, accounted for.</h2>
      <p className="text-muted-foreground">
        Manufacturers, distributors and pharmacies record each handover. Patients scan the pack and see where
        it has been.
      </p>
    </div>

    <figure className="bg-card max-w-md rounded-xl border p-5 shadow-sm" aria-label="Example pack history">
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium">{SAMPLE_JOURNEY.packId}</p>
          <p className="text-muted-foreground truncate text-xs">{SAMPLE_JOURNEY.product}</p>
        </div>
        <span className="bg-success-soft text-success inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Chain intact
        </span>
      </div>
      <ol className="mt-4 space-y-4">
        {SAMPLE_JOURNEY.events.map((event, index) => (
          <li key={`${event.actor}-${event.time}`} className="relative grid grid-cols-[16px_1fr_auto] gap-3">
            <span className="relative flex justify-center pt-1.5" aria-hidden="true">
              <span className="bg-primary size-2 rounded-full" />
              {index < SAMPLE_JOURNEY.events.length - 1 ? (
                <span className="bg-border absolute -bottom-4 top-4 w-px" />
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{event.label}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {event.actor} · {event.place}
              </span>
            </span>
            <span className="tabular text-muted-foreground pt-0.5 text-xs">{event.time}</span>
          </li>
        ))}
      </ol>
      <figcaption className="text-muted-foreground mt-4 border-t pt-3 text-xs">Sample record</figcaption>
    </figure>
  </div>
);
