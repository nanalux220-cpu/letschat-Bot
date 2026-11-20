import { getOrCreateBot, getUser, json } from "@/lib/auth";
import { appUrl, getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return json(401, { error: "unauthorized" });
  const bot = await getOrCreateBot(user);
  if (!bot.stripe_customer_id) return json(400, { error: "No billing account yet." });
  const session = await getStripe().billingPortal.sessions.create({
    customer: bot.stripe_customer_id,
    return_url: `${appUrl()}/dashboard`,
  });
  return json(200, { url: session.url });
}
