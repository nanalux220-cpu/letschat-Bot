import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

/** Server-only client with full access. Never import this into a client component. */
export function supabaseAdmin(): SupabaseClient {
  if (!admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env vars are missing");
    admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return admin;
}

export type Bot = {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  color: string;
  welcome: string;
  business_info: string;
  whatsapp: string | null;
  lead_email: string | null;
  allowed_domains: string[];
  plan: "none" | "starter" | "pro";
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};
