"use client";

import { useState } from "react";
import Link from "next/link";

type Ticker = { id: string; symbol: string; count: number };

export function TickerSearch({ tickers }: { tickers: Ticker[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? tickers.filter((t) => t.symbol.includes(query.trim().toUpperCase()))
    : tickers;

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ticker — must match Yahoo Finance (e.g. AAPL, QAN.AX)"
        className="mb-6 w-full rounded border border-[var(--border-strong)] px-4 py-2.5 text-sm uppercase placeholder:normal-case placeholder:text-[var(--muted)]"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {tickers.length === 0
            ? "No models uploaded yet. Be the first — "
            : "No tickers match your search. "}
          {tickers.length === 0 && (
            <Link href="/community/upload" className="text-[var(--navy)] underline">
              upload one
            </Link>
          )}
        </p>
      ) : (
        <div className="card-grid list">
          {filtered.map((t) => (
            <Link key={t.id} href={`/community/${t.symbol}`} className="card">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">{t.symbol}</span>
                <span className="text-sm text-[var(--muted)]">
                  {t.count} model{t.count === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
