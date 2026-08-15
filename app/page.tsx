import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div
        className="relative overflow-hidden bg-[var(--navy)] bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/world_dot_map.jpg)" }}
      >
        {/* Flat, uniform scrim — same darkness everywhere across the
            image, unlike the earlier left-to-right gradient. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[var(--navy)]/45"
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-28">
          <p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
          >
            An Open Valuation Community
          </p>
          <h1
            className="mb-7 whitespace-nowrap font-[family-name:var(--font-cormorant)] text-[clamp(1.4rem,4.6vw,3.5rem)] font-normal leading-tight tracking-tight"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.65)" }}
          >
            <span className="text-[var(--gold)]">Valuation</span>
            <span className="text-white"> is the foundation of investing.</span>
          </h1>
          <p
            className="mb-10 max-w-lg text-[15px] leading-relaxed text-white/80"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
          >
            Every investment decision rests on a view of what something is
            worth. Upload your own DCF model to put your view on record, or
            browse what everyone else has already published — company by
            company, ticker by ticker.
          </p>
          <div className="flex gap-4">
            <Link
              href="/community"
              className="rounded bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--navy)] hover:opacity-90"
            >
              Browse Community
            </Link>
            <Link
              href="/signup"
              className="rounded border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <section className="border-t border-[var(--border)] bg-[var(--panel-hover)]">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="mb-10 text-xs font-semibold uppercase tracking-widest text-[var(--navy)]">
            How It Works
          </p>
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-3xl font-bold text-[var(--border-strong)]">01</p>
              <p className="mb-1.5 font-semibold text-[var(--ink)]">Register</p>
              <p className="text-sm text-[var(--muted)]">
                Create an account. No credentials required, no approval
                process — the model speaks for itself.
              </p>
            </div>
            <div>
              <p className="mb-3 text-3xl font-bold text-[var(--border-strong)]">02</p>
              <p className="mb-1.5 font-semibold text-[var(--ink)]">Build the case</p>
              <p className="text-sm text-[var(--muted)]">
                Value any listed company with your own modules, and set a
                target price against a defined time horizon.
              </p>
            </div>
            <div>
              <p className="mb-3 text-3xl font-bold text-[var(--border-strong)]">03</p>
              <p className="mb-1.5 font-semibold text-[var(--ink)]">Publish</p>
              <p className="text-sm text-[var(--muted)]">
                Your model is filed under the ticker, next to everyone
                else&apos;s coverage of the same name.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
