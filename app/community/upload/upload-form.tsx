"use client";

import { useActionState } from "react";
import { uploadModel, type UploadState } from "./actions";

const initialState: UploadState = { status: "idle" };

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadModel, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Ticker
        <input
          name="ticker"
          required
          placeholder="e.g. AAPL"
          className="rounded border border-[var(--border)] px-3 py-2 uppercase"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Target price
        <input
          name="target_price"
          type="number"
          step="0.01"
          min="0"
          required
          className="rounded border border-[var(--border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Time horizon
        <select
          name="horizon_months"
          defaultValue="12"
          className="rounded border border-[var(--border)] px-3 py-2"
        >
          <option value="1">1 months</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes (optional)
        <textarea
          name="notes"
          rows={3}
          className="rounded border border-[var(--border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Excel model (.xlsx / .xls)
        <input
          name="file"
          type="file"
          accept=".xlsx,.xls"
          required
          className="rounded border border-[var(--border)] px-3 py-2"
        />
      </label>
      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
