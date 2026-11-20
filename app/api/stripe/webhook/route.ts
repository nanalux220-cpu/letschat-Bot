import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { planForPriceId } from "@/lib/plans";

export const dynamic = "force-dynamic";

async function syncSubscription(sub: Stripe.Subscription) {
  const botId = sub.metadata?.bot_id;
  const plan = planForPriceId(sub.items.data[0]?.price?.id) ?? (sub.metadata?.plan as string | undefined) ?? null;
  const update: Record<string, unknown> = {
    status: sub.status,
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    updated_at: new Date().toISOString(),
  };
  if (plan === "starter" || plan === "pro") update.plan = plan;
  if (sub.status === "canceled") update.plan = "none";
  const db = supabaseAdmin();
  const q = db.from("bots").update(update);
  const { error } = botId ? await q.eq("id", botId) : await q.eq("stripe_customer_id", update.stripe_customer_id as string);
  if (error) throw new Error(error.message);
}

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response("missing signature", { status: 400 });
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), sig, secret);
  } catch {
    return new Response("bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (e) {
    console.error("[stripe] webhook", e instanceof Error ? e.message : e);
    return new Response("handler error", { status: 500 });
  }
  return new Response("ok");
}
