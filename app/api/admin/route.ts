import { getUser, isAdmin, json } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { currentMonth } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!isAdmin(user)) return json(403, { error: "forbidden" });
  const db = supabaseAdmin();
  const [{ data: bots }, { data: usage }, { data: users }] = await Promise.all([
    db.from("bots").select("id, owner_id, name, plan, status, allowed_domains, created_at").order("created_at", { ascending: false }),
    db.from("usage").select("bot_id, count").eq("month", currentMonth()),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const used = new Map((usage ?? []).map((u) => [u.bot_id, u.count]));
  const emails = new Map((users?.users ?? []).map((u) => [u.id, u.email]));
  return json(200, {
    bots: (bots ?? []).map((b) => ({ ...b, email: emails.get(b.owner_id) ?? "", used: used.get(b.id) ?? 0 })),
  });
}
