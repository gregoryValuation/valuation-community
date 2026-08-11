"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = { status: "idle" };

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, initialState);

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold text-[var(--ink)]">Sign up</h1>

      {state.status === "check-email" ? (
        <p className="text-sm text-[var(--muted)]">
          Check your email to confirm your account, then{" "}
          <Link href="/login" className="text-[var(--navy)] underline">
            log in
          </Link>
          .
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
          <input
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]{3,20}"
            title="3-20 characters: letters, numbers, or underscores only"
            placeholder="Username"
            className="rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            className="rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
          {state.status === "error" && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Sign up"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--navy)] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
