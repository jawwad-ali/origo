import { type LedgerEventDto } from "@origo/shared";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HASH_PREVIEW_LENGTH, LEDGER_EVENT_STYLE } from "../constants";

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const NODE_TONE = {
  info: "bg-accent text-accent-foreground",
  success: "bg-success-soft text-success",
  danger: "bg-destructive-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-warning-soft text-warning",
} as const;

const counterpartLabel = (event: LedgerEventDto): string | null => {
  if (!event.counterparty) return null;
  // The sender acts on SENT and CANCELLED (goods going to the other party); the receiver on RECEIVED and REJECTED.
  const outbound = event.type === "TRANSFER_SENT" || event.type === "TRANSFER_CANCELLED";
  return `${outbound ? "to" : "from"} ${event.counterparty.name}`;
};

const Hash = ({ label, value }: { label: string; value: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        tabIndex={0}
        className="hover:text-foreground focus-visible:ring-ring cursor-help rounded-sm outline-none focus-visible:ring-2"
      >
        {label} {value.slice(0, HASH_PREVIEW_LENGTH)}…
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs break-all font-mono text-xs">{value}</TooltipContent>
  </Tooltip>
);

/** The pack's journey, oldest first. Each entry shows its hash and the hash it links back to. */
export const PackTimeline = ({ events }: { events: LedgerEventDto[] }) => (
  <ol className="relative" aria-label="Pack history">
    {events.map((event, index) => {
      const style = LEDGER_EVENT_STYLE[event.type];
      const Icon = style.icon;
      const isLast = index === events.length - 1;
      const counterpart = counterpartLabel(event);
      return (
        <li key={event.seq} className="relative grid grid-cols-[2.25rem_1fr] gap-4 pb-6 last:pb-0">
          {!isLast ? (
            <span
              className="bg-border absolute left-[1.0625rem] top-9 h-[calc(100%-2.25rem)] w-px"
              aria-hidden="true"
            />
          ) : null}
          <span
            className={cn(
              "ring-background relative z-10 flex size-9 items-center justify-center rounded-full ring-4",
              NODE_TONE[style.tone],
            )}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <p className="text-sm">
                <span className="text-muted-foreground">{style.verb} </span>
                <span className="font-medium">{event.actor.name}</span>
                <span className="text-muted-foreground"> · {event.actor.city}</span>
              </p>
              <time dateTime={event.createdAt} className="tabular text-muted-foreground text-xs">
                {DATE_TIME.format(new Date(event.createdAt))}
              </time>
            </div>
            {counterpart || event.transferReference ? (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {counterpart}
                {counterpart && event.transferReference ? " · " : null}
                {event.transferReference ? (
                  <span className="font-mono text-xs">{event.transferReference}</span>
                ) : null}
              </p>
            ) : null}
            <p className="text-muted-foreground mt-1.5 flex flex-wrap gap-x-3 font-mono text-[0.7rem]">
              <span className="text-foreground/70">#{event.seq}</span>
              <Hash label="hash" value={event.hash} />
              <Hash label="prev" value={event.prevHash} />
            </p>
          </div>
        </li>
      );
    })}
  </ol>
);
