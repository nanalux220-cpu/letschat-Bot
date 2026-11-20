import { getOrCreateBot, getUser, json } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" };

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return json(401, { error: "unauthorized" });
  const bot = await getOrCreateBot(user);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json(400, { error: "No file" });
  const ext = TYPES[file.type];
  if (!ext) return json(400, { error: "Use a PNG, JPG, WEBP or SVG image." });
  if (file.size > 1_000_000) return json(400, { error: "Logo must be under 1 MB." });

  const db = supabaseAdmin();
  const path = `${bot.id}/logo-${Date.now()}.${ext}`;
  const { error } = await db.storage.from("logos").upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true });
  if (error) return json(500, { error: "Upload failed" });
  const { data } = db.storage.from("logos").getPublicUrl(path);
  await db.from("bots").update({ logo_url: data.publicUrl, updated_at: new Date().toISOString() }).eq("id", bot.id);
  return json(200, { logo_url: data.publicUrl });
}
