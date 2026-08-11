import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/get-user";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border)] bg-white/90 px-8 py-5 backdrop-blur">
      <Link href="/" className="text-base font-bold text-[var(--ink)]">
        Valuation <em className="text-[var(--gold)] not-italic">Community</em>
      </Link>
      <div className="flex items-center gap-9 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--ink)]">
          Home
        </Link>
        <Link href="/community" className="hover:text-[var(--ink)]">
          Community
        </Link>
        {user ? (
          <Link href="/profile" className="hover:text-[var(--ink)]">
            Profile
          </Link>
        ) : (
          <>
            <Link href="/login" className="hover:text-[var(--ink)]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-[var(--navy)] px-4 py-2 text-white normal-case tracking-normal hover:opacity-90"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
