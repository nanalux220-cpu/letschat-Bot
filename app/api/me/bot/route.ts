import { getOrCreateBot, getUser, json } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cleanDomains } from "@/lib/cors";
import { currentMonth, planLimit } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return json(401, { error: "unauthorized" });
  const bot = await getOrCreateBot(user);
  const { data: usage } = await supabaseAdmin()
    .from("usage")
    .select("count")
    .eq("bot_id", bot.id)
    .eq("month", currentMonth())
    .maybeSingle();
  return json(200, { bot, usage: { used: usage?.count ?? 0, limit: planLimit(bot.plan) }, email: user.email });
}

const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);

export async function PUT(request: Request) {
  const user = await getUser(request);
  if (!user) return json(401, { error: "unauthorized" });
  const bot = await getOrCreateBot(user);
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const name = str(b.name, 80);
  if (name) update.name = name;
  const color = str(b.color, 7);
  if (color && /^#[0-9a-f]{6}$/i.test(color)) update.color = color;
  const welcome = str(b.welcome, 300);
  if (welcome !== undefined) update.welcome = welcome || "Hi! How can we help you today?";
  const info = str(b.business_info, 20000);
  if (info !== undefined) update.business_info = info;
  const wa = str(b.whatsapp, 20);
  if (wa !== undefined) update.whatsapp = wa.replace(/[^0-9+]/g, "") || null;
  const email = str(b.lead_email, 200);
  if (email !== undefined) update.lead_email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
  if (b.allowed_domains !== undefined) {
    const list = cleanDomains(b.allowed_domains);
    // Starter covers one website (www and subdomains included).
    update.allowed_domains = bot.plan === "pro" ? list : list.slice(0, 1);
  }

  const { data, error } = await supabaseAdmin().from("bots").update(update).eq("id", bot.id).select("*").single();
  if (error) return json(500, { error: "save_failed" });
  return json(200, { bot: data });
}
