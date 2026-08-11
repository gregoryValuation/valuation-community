import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { filterLiveModels } from "@/lib/models";

export default async function TickerPage(props: PageProps<"/community/[ticker]">) {
  const { ticker } = await props.params;
  const symbol = decodeURIComponent(ticker).toUpperCase();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: tickerRow } = await supabase
    .from("tickers")
    .select("id, symbol")
    .eq("symbol", symbol)
    .maybeSingle();

  if (!tickerRow) notFound();

  const { data: models } = await supabase
    .from("models")
    .select(
      "id, target_price, horizon_months, notes, original_filename, file_path, created_at, profiles(username)"
    )
    .eq("ticker_id", tickerRow.id)
    .order("created_at", { ascending: false });

  // Drops (and cleans up) any rows whose file was deleted directly in
  // Supabase Storage, and attaches a signed download link to the rest —
  // one batched Storage call for the whole ticker instead of one per row.
  const liveModels = await filterLiveModels(models ?? []);
  const modelsWithUrls = liveModels.map((m) => ({
    ...m,
    username:
      (m.profiles as unknown as { username: string }[] | null)?.[0]
        ?.username ?? "unknown",
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/community"
        className="mb-6 inline-block text-sm font-semibold text-[var(--muted)] hover:text-[var(--navy)]"
      >
        ← Back to Community
      </Link>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="section-title-row flex-1">
          <div className="section-eyebrow">{tickerRow.symbol}</div>
          <span className="section-rule" />
        </div>
        <Link
          href="/community/upload"
          className="whitespace-nowrap rounded bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Upload Model
        </Link>
      </div>

      {modelsWithUrls.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No models yet for this ticker. Be the first —{" "}
          <Link href="/community/upload" className="text-[var(--navy)] underline">
            upload one
          </Link>
          .
        </p>
      ) : (
        <div className="border border-[var(--border)]">
          {/* header row */}
          <div className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-hover)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <span className="w-28 shrink-0">Target Price</span>
            <span className="w-28 shrink-0">Date</span>
            <span className="flex-1">User</span>
            <span className="shrink-0">File</span>
          </div>

          {modelsWithUrls.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 border-b border-[var(--border)] px-5 py-3.5 last:border-b-0 hover:bg-[var(--panel-hover)]"
            >
              <span className="w-28 shrink-0 font-semibold text-[var(--ink)]">
                {m.target_price}
              </span>
              <span className="w-28 shrink-0 text-sm text-[var(--muted)]">
                {new Date(m.created_at).toLocaleDateString()}
              </span>
              <span className="flex-1 truncate text-sm text-[var(--ink)]">
                {m.username}
                {m.notes && (
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    — {m.notes}
                  </span>
                )}
              </span>
              <a
                href={m.url}
                className="shrink-0 text-sm font-semibold text-[var(--navy)] underline"
              >
                View / Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
