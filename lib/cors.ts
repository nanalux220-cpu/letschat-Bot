import type { Bot } from "./supabase-admin";

/** CORS headers for the public widget endpoints. */
export function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "access-control-allow-origin": origin || "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function hostOf(value: string): string | null {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Is this website allowed to use the bot? The business lists its domains in the dashboard.
 * An empty list allows any site (handy while setting up). Our own app (preview page) is always allowed.
 */
export function originAllowed(bot: Pick<Bot, "allowed_domains">, origin: string | null): boolean {
  if (!origin) return false;
  const host = hostOf(origin);
  if (!host) return false;
  const app = process.env.NEXT_PUBLIC_APP_URL ? hostOf(process.env.NEXT_PUBLIC_APP_URL) : null;
  if (app && host === app) return true;
  if (host === "localhost") return true;
  const list = (bot.allowed_domains || []).map(hostOf).filter(Boolean) as string[];
  if (list.length === 0) return true;
  return list.some((d) => host === d || host.endsWith(`.${d}`));
}

export function cleanDomains(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const v of input.slice(0, 10)) {
    if (typeof v !== "string") continue;
    const h = hostOf(v.trim());
    if (h && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(h)) out.add(h);
  }
  return [...out];
}
