"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
  }
  return client;
}

/** fetch() with the signed-in user's token attached. */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabaseBrowser().auth.getSession();
  const headers = new Headers(init.headers);
  if (data.session) headers.set("authorization", `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, headers });
}
