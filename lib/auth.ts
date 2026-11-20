import type { User } from "@supabase/supabase-js";
import { supabaseAdmin, type Bot } from "./supabase-admin";

export async function getUser(request: Request): Promise<User | null> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/** The signed-in user's bot, created on first use. */
export async function getOrCreateBot(user: User): Promise<Bot> {
  const db = supabaseAdmin();
  const { data: existing } = await db.from("bots").select("*").eq("owner_id", user.id).maybeSingle();
  if (existing) return existing as Bot;
  const { data, error } = await db
    .from("bots")
    .insert({ owner_id: user.id, lead_email: user.email ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as Bot;
}

export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false;
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}

export function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });
}
