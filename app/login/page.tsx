"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold text-[var(--ink)]">Log in</h1>

      <form action={action} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded border border-[var(--border)] px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
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
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--navy)] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
