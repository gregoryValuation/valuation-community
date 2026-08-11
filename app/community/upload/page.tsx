import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { UploadForm } from "./upload-form";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link
        href="/community"
        className="mb-6 inline-block text-sm font-semibold text-[var(--muted)] hover:text-[var(--navy)]"
      >
        ← Back to Community
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[var(--ink)]">
        Upload a model
      </h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Ticker must match Yahoo Finance exactly — e.g.{" "}
        <code>AAPL</code>, <code>QAN.AX</code>, <code>000001.SS</code>.
      </p>
      <UploadForm />
    </div>
  );
}
