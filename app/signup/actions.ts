"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "check-email" };

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    return {
      status: "error",
      message: "Email, username, and password are required.",
    };
  }
  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters.",
    };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      status: "error",
      message:
        "Username must be 3-20 characters: letters, numbers, or underscores only.",
    };
  }

  const supabase = await createClient();

  // Best-effort pre-check so the common case shows an immediate, friendly
  // error. The database's unique index on lower(username) is still the
  // real guard against the rare race where two people submit the same
  // username at once — see the catch-all error handling below.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "That username is already taken.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    // The database trigger that creates the profile row also enforces
    // uniqueness — if the friendly pre-check above lost a race, this is
    // what actually catches it.
    const message = /duplicate|unique|taken/i.test(error.message)
      ? "That username is already taken."
      : error.message;
    return { status: "error", message };
  }

  // If email confirmation is enabled in the Supabase project (the default),
  // signUp succeeds but there's no session yet until the user clicks the
  // confirmation link.
  if (!data.session) {
    return { status: "check-email" };
  }

  redirect("/community");
}
