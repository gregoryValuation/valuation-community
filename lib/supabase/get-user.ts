import { cache } from "react";
import { createClient } from "./server";

// The root layout's <Nav> and every page both need to know who's signed
// in, and each independently called supabase.auth.getUser() — a real
// network round trip to Supabase Auth every time. React's cache() dedupes
// that: multiple calls to getCurrentUser() within the same request share
// one underlying call instead of stacking up 2-3 per page load.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
