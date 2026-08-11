import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { filterLiveModels } from "@/lib/models";
import { TickerSearch } from "./ticker-search";

export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: tickerRows } = await supabase
    .from("tickers")
    .select("id, symbol, models(id, file_path)")
    .order("symbol");

  // One batched liveness check across every ticker's models at once,
  // rather than per-ticker, then group back up by ticker. Tickers whose
  // last live model just got cleaned up (file deleted outside the app)
  // drop out of the list entirely instead of showing "0 models".
  const flatModels = (tickerRows ?? []).flatMap((t) =>
    (t.models as { id: string; file_path: string }[]).map((m) => ({
      ...m,
      ticker_id: t.id as string,
    }))
  );
  const liveModels = await filterLiveModels(flatModels);
  const liveCountByTicker = new Map<string, number>();
  for (const m of liveModels) {
    liveCountByTicker.set(m.ticker_id, (liveCountByTicker.get(m.ticker_id) ?? 0) + 1);
  }

  const tickers = (tickerRows ?? [])
    .map((t) => ({
      id: t.id,
      symbol: t.symbol,
      count: liveCountByTicker.get(t.id) ?? 0,
    }))
    .filter((t) => t.count > 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="mb-6 inline-block text-sm font-semibold text-[var(--muted)] hover:text-[var(--navy)]"
      >
        ← Back
      </Link>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="section-title-row flex-1">
          <div className="section-eyebrow">Community</div>
          <span className="section-rule" />
        </div>
        <Link
          href="/community/upload"
          className="whitespace-nowrap rounded bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Upload Model
        </Link>
      </div>

      <TickerSearch tickers={tickers} />
    </div>
  );
}
