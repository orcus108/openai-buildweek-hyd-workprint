export default function Loading() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--background)]">
      <div className="w-full max-w-sm px-6" aria-label="Loading Workprint">
        <div className="mb-10 h-5 w-24 animate-pulse rounded-md bg-[var(--surface-hover)]" />
        <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-[var(--surface-hover)]" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
      </div>
    </main>
  );
}
