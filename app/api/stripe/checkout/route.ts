import { getOrCreateBot, getUser, json } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { appUrl, getStripe } from "@/lib/stripe";
import { ACTIVE_STATUSES, priceIdFor, type PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return json(401, { error: "unauthorized" });
  const { plan } = (await request.json().catch(() => ({}))) as { plan?: PlanId };
  if (plan !== "starter" && plan !== "pro") return json(400, { error: "invalid plan" });
  const price = priceIdFor(plan);
  if (!price) return json(500, { error: "Price not configured" });

  const bot = await getOrCreateBot(user);
  if (bot.stripe_subscription_id && ACTIVE_STATUSES.has(bot.status)) {
    return json(400, { error: "You already have a plan. Use Manage billing to change it." });
  }
  const stripe = getStripe();

  let customer = bot.stripe_customer_id;
  if (!customer) {
    const c = await stripe.customers.create({ email: user.email, metadata: { bot_id: bot.id, user_id: user.id } });
    customer = c.id;
    await supabaseAdmin().from("bots").update({ stripe_customer_id: customer }).eq("id", bot.id);
  }

  const trial = Number(process.env.TRIAL_DAYS || 0);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: bot.id,
    metadata: { bot_id: bot.id, plan },
    subscription_data: { metadata: { bot_id: bot.id, plan }, ...(trial > 0 ? { trial_period_days: trial } : {}) },
    allow_promotion_codes: true,
    success_url: `${appUrl()}/dashboard?paid=1`,
    cancel_url: `${appUrl()}/dashboard`,
  });
  return json(200, { url: session.url });
}
