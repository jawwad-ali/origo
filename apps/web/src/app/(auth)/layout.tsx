import { OrigoMark } from "@/components/brand/origo-mark";
import { JourneyPanel } from "@/features/auth/components/journey-panel";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <main className="bg-card flex flex-col px-4 py-8 sm:px-10">
        <OrigoMark />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <JourneyPanel />
        </div>
      </aside>
    </div>
  );
}
