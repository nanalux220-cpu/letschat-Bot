import { supabaseAdmin } from "@/lib/supabase-admin";
import { corsHeaders, originAllowed } from "@/lib/cors";
import { ACTIVE_STATUSES } from "@/lib/plans";
import { json } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

/** Public branding for the widget. Only safe-to-show fields. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  const cors = corsHeaders(origin);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json(404, { error: "not_found" }, cors);

  const { data: bot } = await supabaseAdmin()
    .from("bots")
    .select("id, name, logo_url, color, welcome, whatsapp, allowed_domains, status")
    .eq("id", id)
    .maybeSingle();
  if (!bot) return json(404, { error: "not_found" }, cors);
  // Browsers send Origin on cross-site fetches; same-site preview may omit it.
  if (origin && !originAllowed(bot, origin)) return json(403, { error: "domain_not_allowed" }, cors);

  return json(
    200,
    {
      id: bot.id,
      name: bot.name,
      logo: bot.logo_url,
      color: bot.color,
      welcome: bot.welcome,
      whatsapp: bot.whatsapp ? String(bot.whatsapp).replace(/[^0-9]/g, "") : null,
      active: ACTIVE_STATUSES.has(bot.status),
    },
    cors,
  );
}
