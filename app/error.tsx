"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)] px-6 text-[var(--text)]">
      <section className="max-w-sm text-center">
        <h1 className="mb-3 text-2xl font-semibold tracking-[-0.035em]">Something went wrong.</h1>
        <p className="mb-7 text-sm leading-6 text-[var(--text-secondary)]">
          Your work is still private. Try opening the project again.
        </p>
        <button className="button-primary" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
