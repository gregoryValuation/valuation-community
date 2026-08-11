import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { filterLiveModels } from "@/lib/models";
import { logout } from "@/app/logout/actions";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const { data: myModels } = await supabase
    .from("models")
    .select(
      "id, target_price, horizon_months, created_at, file_path, tickers(symbol)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Drops (and cleans up) any rows whose file was deleted directly in
  // Supabase Storage, so the counts below only reflect models that are
  // actually still viewable/downloadable.
  const models = await filterLiveModels(myModels ?? []);
  const tickerCount = new Set(
    models.map((m) => (m.tickers as unknown as { symbol: string }[] | null)?.[0]?.symbol)
  ).size;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 section-title-row">
        <div className="section-eyebrow">Profile</div>
        <span className="section-rule" />
      </div>

      <div className="mb-10 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[var(--muted)]">Signed in as</span>
          <span className="text-lg font-semibold text-[var(--ink)]">
            {profile?.username ?? "(no username set)"}
          </span>
          <span className="text-sm text-[var(--muted)]">{user.email}</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="whitespace-nowrap rounded border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-gray-50 cursor-pointer"
          >
            Log out
          </button>
        </form>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-1 border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
        <div className="bg-white px-6 py-5">
          <div className="text-3xl font-bold text-[var(--ink)]">
            {models.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
            Models uploaded
          </div>
        </div>
        <div className="bg-white px-6 py-5">
          <div className="text-3xl font-bold text-[var(--ink)]">
            {tickerCount}
          </div>
          <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
            Tickers covered
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--navy)]">
        Your models
      </h2>

      {models.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          You haven&apos;t uploaded a model yet —{" "}
          <Link href="/community/upload" className="text-[var(--navy)] underline">
            upload one
          </Link>
          .
        </p>
      ) : (
        <div className="card-grid list">
          {models.map((m) => {
            const symbol = (m.tickers as unknown as { symbol: string }[] | null)?.[0]?.symbol ?? "—";
            return (
              <Link key={m.id} href={`/community/${symbol}`} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--ink)]">{symbol}</span>
                  <span className="text-sm text-[var(--muted)]">
                    Target {m.target_price} · {m.horizon_months}mo
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  Uploaded {new Date(m.created_at).toLocaleDateString()}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
