import { getOrCreateBot, getUser, json } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return json(401, { error: "unauthorized" });
  const bot = await getOrCreateBot(user);
  const { data } = await supabaseAdmin()
    .from("leads")
    .select("id, name, contact, message, page, created_at")
    .eq("bot_id", bot.id)
    .order("created_at", { ascending: false })
    .limit(100);
  return json(200, { leads: data ?? [] });
}
