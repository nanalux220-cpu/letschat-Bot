"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authedFetch, supabaseBrowser } from "@/lib/supabase-browser";
import { PLANS, type PlanId } from "@/lib/plans";

type Bot = {
  id: string;
  name: string;
  logo_url: string | null;
  color: string;
  welcome: string;
  business_info: string;
  whatsapp: string | null;
  lead_email: string | null;
  allowed_domains: string[];
  plan: "none" | PlanId;
  status: string;
};
type Lead = { id: number; name: string; contact: string; message: string; page: string; created_at: string };

const ACTIVE = new Set(["active", "trialing", "past_due"]);

export default function Dashboard() {
  const router = useRouter();
  const [bot, setBot] = useState<Bot | null>(null);
  const [usage, setUsage] = useState({ used: 0, limit: 0 });
  const [email, setEmail] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [domains, setDomains] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const r = await authedFetch("/api/me/bot");
    if (r.status === 401) return router.replace("/login");
    const d = await r.json();
    setBot(d.bot);
    setUsage(d.usage);
    setEmail(d.email || "");
    setDomains((d.bot.allowed_domains || []).join(", "));
    const l = await authedFetch("/api/me/leads");
    if (l.ok) setLeads((await l.json()).leads);
  }, [router]);

  useEffect(() => {
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) router.replace("/login");
        else load();
      });
  }, [load, router]);

  // Came from the pricing page with a plan chosen: send straight to checkout.
  useEffect(() => {
    if (!bot) return;
    const p = new URLSearchParams(window.location.search).get("plan");
    if ((p === "starter" || p === "pro") && !ACTIVE.has(bot.status)) {
      window.history.replaceState(null, "", "/dashboard");
      checkout(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot?.id]);

  function set<K extends keyof Bot>(k: K, v: Bot[K]) {
    setBot((b) => (b ? { ...b, [k]: v } : b));
  }

  async function save() {
    if (!bot) return;
    setBusy(true);
    setMsg("");
    setErr("");
    const r = await authedFetch("/api/me/bot", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: bot.name,
        color: bot.color,
        welcome: bot.welcome,
        business_info: bot.business_info,
        whatsapp: bot.whatsapp || "",
        lead_email: bot.lead_email || "",
        allowed_domains: domains.split(/[\s,]+/).filter(Boolean),
      }),
    });
    const d = await r.json();
    if (r.ok) {
      setBot(d.bot);
      setDomains((d.bot.allowed_domains || []).join(", "));
      setMsg("Saved. Your chatbot is updated.");
    } else setErr(d.error || "Couldn't save.");
    setBusy(false);
  }

  async function uploadLogo(file: File) {
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await authedFetch("/api/me/logo", { method: "POST", body: fd });
    const d = await r.json();
    if (r.ok) set("logo_url", d.logo_url);
    else setErr(d.error || "Upload failed");
  }

  async function checkout(plan: PlanId) {
    setBusy(true);
    setErr("");
    const r = await authedFetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else {
      setErr(d.error || "Couldn't start checkout.");
      setBusy(false);
    }
  }

  async function portal() {
    setBusy(true);
    const r = await authedFetch("/api/stripe/portal", { method: "POST" });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else {
      setErr(d.error || "Couldn't open billing.");
      setBusy(false);
    }
  }

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.replace("/");
  }

  if (!bot) return <div className="dash"><p>Loading...</p></div>;

  const active = ACTIVE.has(bot.status);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script src="${origin}/widget.js" data-bot="${bot.id}" defer></script>`;
  const pct = usage.limit ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <>
      <div className="wrap nav">
        <Link href="/" className="logo">Lets<span>Chat</span></Link>
        <nav>
          <span className="hint hide-sm">{email}</span>
          <button className="btn ghost small" onClick={logout}>Log out</button>
        </nav>
      </div>
      <div className="dash">
        <h1 style={{ marginTop: 0 }}>Your chatbot</h1>

        <div className="card">
          <div className="row">
            <div>
              <h3 style={{ margin: 0 }}>
                Plan:{" "}
                {active && bot.plan !== "none" ? (
                  <>{PLANS[bot.plan].name} <span className="pill">{bot.status === "trialing" ? "Trial" : "Active"}</span></>
                ) : (
                  <span className="pill off">Not active</span>
                )}
              </h3>
              {bot.status === "past_due" && <p className="err">Your last payment failed. Please update your card in billing.</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              {active ? (
                <button className="btn ghost small" onClick={portal} disabled={busy}>Manage billing</button>
              ) : null}
            </div>
          </div>
          {active ? (
            <>
              <div className="bar"><div style={{ width: `${pct}%` }} /></div>
              <div className="hint">
                {usage.used.toLocaleString()} of {usage.limit.toLocaleString()} messages used this month
                {pct >= 80 && bot.plan === "starter" ? " - running low? Upgrade to Pro in Manage billing." : ""}
              </div>
            </>
          ) : (
            <>
              <p className="hint">Choose a plan to switch your chatbot on. You can set it up first and pay when ready.</p>
              <div className="row">
                <button className="btn ghost" onClick={() => checkout("starter")} disabled={busy}>Starter: £9/month, 1,000 messages</button>
                <button className="btn" onClick={() => checkout("pro")} disabled={busy}>Pro: £19/month, 5,000 messages</button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3>Branding</h3>
          <div className="row">
            <div>
              <label htmlFor="name">Business name</label>
              <input id="name" value={bot.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div style={{ flex: "0 0 140px", minWidth: 140 }}>
              <label htmlFor="color">Main colour</label>
              <input id="color" type="color" value={bot.color} onChange={(e) => set("color", e.target.value)} style={{ height: 46, padding: 4 }} />
            </div>
          </div>
          <label>Logo</label>
          <div className="row">
            {bot.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bot.logo_url} alt="Logo" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flex: "0 0 56px", minWidth: 56 }} />
            ) : null}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
          </div>
          <div className="hint">Square images look best. PNG, JPG, WEBP or SVG, under 1 MB.</div>
          <label htmlFor="welcome">Welcome message</label>
          <input id="welcome" value={bot.welcome} maxLength={300} onChange={(e) => set("welcome", e.target.value)} />
        </div>

        <div className="card">
          <h3>What your chatbot knows</h3>
          <p className="hint">
            Add everything customers ask about: services, prices, opening hours, areas you cover, how to book, FAQs, contact details. The chatbot
            only answers from this.
          </p>
          <textarea
            value={bot.business_info}
            maxLength={20000}
            style={{ minHeight: 260 }}
            placeholder={"Example:\nWe're a family-run bakery in Leeds.\nOpening hours: Mon-Sat 8am-5pm, closed Sunday.\nCelebration cakes from £35, order 3 days ahead.\nFree delivery within 5 miles of LS11."}
            onChange={(e) => set("business_info", e.target.value)}
          />
          <div className="hint">{bot.business_info.length.toLocaleString()} / 20,000 characters</div>
        </div>

        <div className="card">
          <h3>Contact and leads</h3>
          <div className="row">
            <div>
              <label htmlFor="wa">WhatsApp number</label>
              <input id="wa" placeholder="447123456789" value={bot.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} />
              <div className="hint">With country code, no spaces. Leave empty to hide the WhatsApp button.</div>
            </div>
            <div>
              <label htmlFor="le">Send new leads to</label>
              <input id="le" type="email" value={bot.lead_email || ""} onChange={(e) => set("lead_email", e.target.value)} />
            </div>
          </div>
          <label htmlFor="dom">Your website domain(s)</label>
          <input id="dom" placeholder="mybusiness.co.uk" value={domains} onChange={(e) => setDomains(e.target.value)} />
          <div className="hint">
            The chatbot only works on these sites, so nobody else can use your messages.
            {bot.plan === "starter" ? " Starter includes 1 website." : ""} Leave empty while testing.
          </div>
        </div>

        <div className="row" style={{ marginBottom: 18 }}>
          <button className="btn" onClick={save} disabled={busy} style={{ flex: "0 0 auto" }}>Save changes</button>
          <Link href={`/preview/${bot.id}`} className="btn ghost" style={{ flex: "0 0 auto" }} target="_blank">Preview chatbot</Link>
          <div>
            {msg && <span className="okmsg">{msg}</span>}
            {err && <span className="err">{err}</span>}
          </div>
        </div>

        <div className="card">
          <h3>Add it to your website</h3>
          <p className="hint">
            Paste this just before <code>&lt;/body&gt;</code> on every page. In WordPress, use a plugin like &quot;WPCode&quot; (Header &amp; Footer).
            In Wix: Settings &gt; Custom code. In Shopify: theme.liquid.
          </p>
          <pre>{snippet}</pre>
          <button
            className="btn ghost small"
            onClick={() => navigator.clipboard.writeText(snippet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>

        <div className="card">
          <h3>Leads ({leads.length})</h3>
          {leads.length === 0 ? (
            <p className="hint">When visitors leave their details, they'll appear here.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Message</th></tr></thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td>{new Date(l.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td>{l.name || "-"}</td>
                      <td>{l.contact}</td>
                      <td>{l.message || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
