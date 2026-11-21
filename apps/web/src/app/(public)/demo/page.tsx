import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoLoginButton } from "@/features/demo/components/demo-login-button";
import { SampleCard } from "@/features/demo/components/sample-card";
import { DEMO_ACCOUNTS } from "@/features/demo/constants";
import { demoPassword, getDemoSamples } from "@/features/demo/services/demo.server";

export const metadata: Metadata = {
  title: "Try the demo",
  description: "Scan sample medicine packs and sign in as each role in the Origo supply chain.",
  robots: { index: true, follow: true },
};

/** Samples and demo data change as visitors use the demo, so always render fresh. */
export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const samples = await getDemoSamples();
  if (!samples) notFound();
  const password = demoPassword();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Try Origo</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Everything here is demo data, moved through the real system: every pack below has a signed code and
          a hash-chained history. Scan one with your phone camera, or open the result.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="samples">
        <h2 id="samples" className="text-base font-semibold">
          What a patient sees
        </h2>
        <div className="grid gap-3">
          {samples.map((sample) => (
            <SampleCard key={sample.key} sample={sample} />
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="accounts">
        <div className="space-y-1">
          <h2 id="accounts" className="text-base font-semibold">
            Sign in as a role
          </h2>
          <p className="text-muted-foreground text-sm">
            {password ? (
              <>
                Demo accounts share the password{" "}
                <span className="text-foreground whitespace-nowrap font-mono">{password}</span>.
              </>
            ) : (
              "Ask the owner of this deployment for the demo password."
            )}
          </p>
        </div>
        <ul className="bg-card divide-y rounded-xl border">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {account.role}{" "}
                  <span className="text-muted-foreground font-normal">· {account.organization}</span>
                </p>
                <p className="text-muted-foreground font-mono text-xs">{account.email}</p>
                <p className="text-muted-foreground mt-1 text-sm">{account.tryThis}</p>
              </div>
              {password && account.email.endsWith("@demo.origo.dev") ? (
                <DemoLoginButton email={account.email} password={password} role={account.role} />
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
