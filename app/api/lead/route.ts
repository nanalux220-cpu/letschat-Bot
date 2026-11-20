import { supabaseAdmin, type Bot } from "@/lib/supabase-admin";
import { corsHeaders, originAllowed } from "@/lib/cors";
import { ACTIVE_STATUSES } from "@/lib/plans";
import { json } from "@/lib/auth";

export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const cors = corsHeaders(origin);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid json" }, cors);
  }
  const botId = clip(body.botId, 36);
  const name = clip(body.name, 100);
  const contact = clip(body.contact, 150);
  const message = clip(body.message, 1000);
  const page = clip(body.page, 300);
  if (!/^[0-9a-f-]{36}$/i.test(botId)) return json(400, { error: "invalid botId" }, cors);
  if (contact.length < 5) return json(400, { error: "Please add an email or phone number." }, cors);

  const db = supabaseAdmin();
  const { data: bot } = await db.from("bots").select("*").eq("id", botId).maybeSingle<Bot>();
  if (!bot || !ACTIVE_STATUSES.has(bot.status)) return json(404, { error: "not_found" }, cors);
  if (!originAllowed(bot, origin)) return json(403, { error: "domain_not_allowed" }, cors);

  const { error } = await db.from("leads").insert({ bot_id: bot.id, name, contact, message, page });
  if (error) return json(500, { error: "server_error" }, cors);

  // Optional email to the business.
  if (process.env.RESEND_API_KEY && bot.lead_email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_EMAIL_FROM || "LetsChat <onboarding@resend.dev>",
          to: [bot.lead_email],
          subject: `New enquiry from your website chat${name ? `: ${name}` : ""}`,
          html: `<p><b>Name:</b> ${esc(name || "-")}<br><b>Contact:</b> ${esc(contact)}<br><b>Page:</b> ${esc(page || "-")}</p><p>${esc(message || "-")}</p>`,
        }),
      });
    } catch (e) {
      console.error("[lead] email", e instanceof Error ? e.message : e);
    }
  }
  return json(200, { ok: true }, cors);
}
