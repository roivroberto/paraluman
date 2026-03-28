import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
      <div className="flex max-w-md flex-col items-start gap-4 rounded-3xl border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Paraluman
        </p>
        <h1 className="font-heading text-4xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The route you requested does not exist in the current Sabay Publish
          prototype.
        </p>
        <Link
          className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          href="/"
        >
          Return to the app
        </Link>
      </div>
    </main>
  );
}
