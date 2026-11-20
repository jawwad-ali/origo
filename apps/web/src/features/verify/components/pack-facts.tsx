import { DOSAGE_FORM_LABELS, type VerificationDto } from "@origo/shared";
import { Thermometer } from "lucide-react";
import { ExpiryDate } from "@/features/catalog/components/catalog-badges";
import { formatDate } from "@/lib/format";

type PackView = NonNullable<VerificationDto["pack"]>;

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right">{children}</dd>
  </div>
);

/** What's in the box, who made it, when it expires and how to keep it. */
export const PackFacts = ({ pack }: { pack: PackView }) => (
  <section className="bg-card space-y-4 rounded-2xl border p-5 sm:p-6" aria-labelledby="product">
    <div>
      <h2 id="product" className="text-lg font-semibold tracking-tight">
        {pack.product.name} {pack.product.strength}
      </h2>
      <p className="text-muted-foreground text-sm">
        {pack.product.genericName} · {DOSAGE_FORM_LABELS[pack.product.dosageForm]} · {pack.product.packSize}
      </p>
    </div>
    <dl className="divide-y border-y">
      <Fact label="Expires">
        <ExpiryDate isoDate={pack.batch.expiresOn} />
      </Fact>
      <Fact label="Batch">
        <span className="font-mono">{pack.batch.batchNumber}</span>
      </Fact>
      <Fact label="Made by">
        {pack.manufacturer.name}
        <span className="text-muted-foreground block text-xs">
          {pack.manufacturer.city}, {pack.manufacturer.country}
        </span>
      </Fact>
      <Fact label="Manufactured">{formatDate(`${pack.batch.manufacturedOn}T00:00:00Z`)}</Fact>
      <Fact label="Recall">
        {pack.batch.recalled ? (
          <span className="text-destructive font-medium">Recalled</span>
        ) : (
          <span>None</span>
        )}
      </Fact>
    </dl>
    <div className="bg-muted/60 flex gap-3 rounded-xl p-4">
      <Thermometer className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-medium">How to store it</p>
        <p className="text-muted-foreground leading-relaxed">{pack.product.storageInstructions}</p>
      </div>
    </div>
  </section>
);
