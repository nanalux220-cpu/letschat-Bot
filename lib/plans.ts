export type PlanId = "starter" | "pro";

export const PLANS: Record<PlanId, { name: string; price: number; messages: number; whatsappBot: boolean }> = {
  starter: { name: "Starter", price: 9, messages: 1000, whatsappBot: false },
  pro: { name: "Pro", price: 19, messages: 5000, whatsappBot: true },
};

export function planLimit(plan: string): number {
  return plan === "starter" || plan === "pro" ? PLANS[plan].messages : 0;
}

export function priceIdFor(plan: PlanId): string | undefined {
  return plan === "starter" ? process.env.STRIPE_PRICE_STARTER : process.env.STRIPE_PRICE_PRO;
}

export function planForPriceId(priceId: string | undefined | null): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

export const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function currentMonth(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}
