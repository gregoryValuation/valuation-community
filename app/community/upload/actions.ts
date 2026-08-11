"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UploadState =
  | { status: "idle" }
  | { status: "error"; message: string };

// Same public endpoint yfinance itself calls under the hood — no API key,
// but unofficial, so treat failures as "couldn't verify" rather than crash.
async function lookupYahooSymbol(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const symbol = data?.chart?.result?.[0]?.meta?.symbol;
    return typeof symbol === "string" ? symbol : null;
  } catch {
    return null;
  }
}

export async function uploadModel(
  _prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "You must be logged in to upload." };
  }

  const rawTicker = String(formData.get("ticker") ?? "")
    .trim()
    .toUpperCase();
  const targetPrice = Number(formData.get("target_price"));
  const horizonMonths = Number(formData.get("horizon_months"));
  const notes = String(formData.get("notes") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!rawTicker) {
    return { status: "error", message: "Ticker is required." };
  }
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
    return { status: "error", message: "Enter a valid target price." };
  }
  if (![3, 6, 12, 24].includes(horizonMonths)) {
    return { status: "error", message: "Choose a valid time horizon." };
  }
  if (!file || file.size === 0) {
    return { status: "error", message: "Please choose a file to upload." };
  }
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    return {
      status: "error",
      message: "Only .xlsx or .xls files are supported.",
    };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { status: "error", message: "File is too large (20MB max)." };
  }

  const symbol = await lookupYahooSymbol(rawTicker);
  if (!symbol) {
    return {
      status: "error",
      message: `"${rawTicker}" doesn't match a Yahoo Finance ticker. Double-check the symbol (e.g. AAPL, QAN.AX, 000001.SS).`,
    };
  }

  let tickerId: string;
  const { data: existingTicker } = await supabase
    .from("tickers")
    .select("id")
    .eq("symbol", symbol)
    .maybeSingle();

  if (existingTicker) {
    tickerId = existingTicker.id;
  } else {
    const { data: newTicker, error: tickerError } = await supabase
      .from("tickers")
      .insert({ symbol })
      .select("id")
      .single();
    if (tickerError || !newTicker) {
      return {
        status: "error",
        message: "Could not create ticker: " + tickerError?.message,
      };
    }
    tickerId = newTicker.id;
  }

  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("models")
    .upload(path, file);
  if (uploadError) {
    return { status: "error", message: "Upload failed: " + uploadError.message };
  }

  const { error: insertError } = await supabase.from("models").insert({
    user_id: user.id,
    ticker_id: tickerId,
    target_price: targetPrice,
    horizon_months: horizonMonths,
    notes: notes || null,
    file_path: path,
    original_filename: file.name,
  });
  if (insertError) {
    // Clean up the orphaned file so a failed insert doesn't leave storage
    // with a file no database row points to.
    await supabase.storage.from("models").remove([path]);
    return {
      status: "error",
      message: "Could not save model: " + insertError.message,
    };
  }

  revalidatePath(`/community/${symbol}`);
  revalidatePath("/community");
  redirect(`/community/${symbol}`);
}
