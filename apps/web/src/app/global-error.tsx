"use client";

import "./globals.css";

/**
 * Last-resort error page, shown when the root layout itself fails. It replaces the whole
 * document, so it can't rely on providers or fonts from the layout.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-dvh items-center justify-center px-4 font-sans">
        <main className="max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold">Origo couldn&apos;t load</h1>
          <p className="text-muted-foreground text-sm">
            Something went wrong on our side. Your data is safe. Try again, and if it keeps happening, come
            back in a few minutes.
          </p>
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground focus-visible:ring-ring rounded-md px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
