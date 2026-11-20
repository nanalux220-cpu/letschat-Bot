"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authedFetch } from "@/lib/supabase-browser";
import { PLANS } from "@/lib/plans";

type Row = { id: string; name: string; email: string; plan: string; status: string; used: number; allowed_domains: string[]; created_at: string };

export default function Admin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    authedFetch("/api/admin").then(async (r) => {
      if (!r.ok) return setErr(r.status === 403 ? "Not allowed. Log in with an admin email." : "Error loading");
      setRows((await r.json()).bots);
    });
  }, []);

  const paying = (rows || []).filter((r) => ["active", "trialing", "past_due"].includes(r.status));
  const mrr = paying.reduce((n, r) => n + (r.plan === "starter" || r.plan === "pro" ? PLANS[r.plan].price : 0), 0);
  const msgs = (rows || []).reduce((n, r) => n + r.used, 0);

  return (
    <div className="dash" style={{ maxWidth: 1100 }}>
      <div className="nav"><Link href="/" className="logo">Lets<span>Chat</span></Link><Link href="/dashboard">Dashboard</Link></div>
      <h1>Admin</h1>
      {err && <p className="err">{err}</p>}
      {rows && (
        <>
          <div className="grid" style={{ marginBottom: 18 }}>
            <div className="card"><div className="hint">Paying customers</div><h2 style={{ textAlign: "left" }}>{paying.length}</h2></div>
            <div className="card"><div className="hint">Monthly revenue</div><h2 style={{ textAlign: "left" }}>£{mrr}</h2></div>
            <div className="card"><div className="hint">AI messages this month</div><h2 style={{ textAlign: "left" }}>{msgs.toLocaleString()}</h2></div>
            <div className="card"><div className="hint">Signups</div><h2 style={{ textAlign: "left" }}>{rows.length}</h2></div>
          </div>
          <div className="card" style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Business</th><th>Email</th><th>Plan</th><th>Status</th><th>Messages</th><th>Website</th><th>Joined</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.plan}</td>
                    <td>{r.status}</td>
                    <td>{r.used.toLocaleString()}</td>
                    <td>{(r.allowed_domains || []).join(", ") || "-"}</td>
                    <td>{new Date(r.created_at).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
