import { createClient } from "./supabase/server";

/**
 * Given a batch of model rows, checks (in one Storage API call) which
 * ones still have a live file behind them, deletes the DB rows for any
 * that don't (e.g. the file was deleted directly in the Supabase
 * dashboard, bypassing the app), and returns only the still-live rows —
 * each with a `url` (60s signed download link) attached, so callers that
 * need a download link don't have to make a second Storage call.
 *
 * Note: deleting someone else's orphaned row is blocked by row-level
 * security (a user can only delete their own models), so orphaned rows
 * belonging to other users stay hidden from listings/counts but aren't
 * actually removed from the database until their owner's session
 * triggers this same cleanup.
 */
export async function filterLiveModels<
  T extends { id: string; file_path: string },
>(models: T[]): Promise<(T & { url: string })[]> {
  if (models.length === 0) return [];

  const supabase = await createClient();
  const paths = models.map((m) => m.file_path);
  const { data: signed } = await supabase.storage
    .from("models")
    .createSignedUrls(paths, 60);

  const urlByPath = new Map(
    (signed ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl])
  );

  const live = models
    .filter((m) => urlByPath.has(m.file_path))
    .map((m) => ({ ...m, url: urlByPath.get(m.file_path)! }));
  const deadIds = models
    .filter((m) => !urlByPath.has(m.file_path))
    .map((m) => m.id);

  if (deadIds.length > 0) {
    await supabase.from("models").delete().in("id", deadIds);
  }

  return live;
}
