import Link from "next/link";
import Script from "next/script";
import { Footer, Nav } from "./_components/site";

const faqs = [
  ["Do I need a developer?", "No. Fill in your business details, copy one line of code and paste it into your website (WordPress, Wix, Squarespace, Shopify or any site). We can help if you get stuck."],
  ["Will it show my brand?", "Yes. The chatbot uses your business name, logo and colours, so customers see your brand."],
  ["What does it answer?", "Anything you add to your business info: services, prices, opening hours, areas you cover, FAQs. If it doesn't know, it asks the visitor to leave their details or message you on WhatsApp."],
  ["What happens if I reach my message limit?", "The chatbot keeps collecting visitor details so you never miss an enquiry, and you can upgrade to Pro at any time."],
  ["Can I cancel?", "Yes, any time from your dashboard. There's no contract."],
];

export default function Home() {
  const demo = process.env.NEXT_PUBLIC_DEMO_BOT_ID;
  return (
    <>
      <Nav />
      <div className="wrap hero">
        <h1>
          Your own <em>AI chatbot</em>,<br />
          with your brand, for £9 a month
        </h1>
        <p>
          LetsChat answers your customers' questions 24/7, collects enquiries while you sleep and sends people to your WhatsApp. It looks like
          yours, because it is yours.
        </p>
        <div className="cta">
          <Link href="/signup" className="btn">Get your chatbot</Link>
          <a href="#pricing" className="btn ghost">See pricing</a>
        </div>
        <div className="note">Set up in about 10 minutes. Cancel any time.</div>
      </div>

      <section className="soft" id="how">
        <div className="wrap">
          <h2>How it works</h2>
          <p className="sub">Three steps and your website has a helpful assistant.</p>
          <div className="grid">
            <div className="card"><div className="step">STEP 1</div><h3>Sign up</h3><p>Create your account and pick a plan.</p></div>
            <div className="card"><div className="step">STEP 2</div><h3>Make it yours</h3><p>Add your name, logo, colours and business info: services, prices, hours and FAQs.</p></div>
            <div className="card"><div className="step">STEP 3</div><h3>Paste one line</h3><p>Copy your code into your website. Your chatbot goes live straight away.</p></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2>Everything a small business needs</h2>
          <p className="sub">No complicated setup, no per-agent fees, no surprises.</p>
          <div className="grid">
            <div className="card"><h3>Your brand</h3><p>Your business name, logo and colours on every chat.</p></div>
            <div className="card"><h3>Answers 24/7</h3><p>Replies instantly using only the information you give it, so it doesn't make things up.</p></div>
            <div className="card"><h3>Never miss a lead</h3><p>Visitors can leave their details. You see them in your dashboard and get them by email.</p></div>
            <div className="card"><h3>WhatsApp button</h3><p>One tap takes customers to your WhatsApp when they want a real person.</p></div>
            <div className="card"><h3>Works on any website</h3><p>WordPress, Wix, Squarespace, Shopify, Webflow or hand-built sites.</p></div>
            <div className="card"><h3>Made in Leeds</h3><p>Built and supported by Dleading Creative Designs, a UK web design agency.</p></div>
          </div>
        </div>
      </section>

      <section className="soft" id="pricing">
        <div className="wrap">
          <h2>Simple pricing</h2>
          <p className="sub">Pay monthly. Upgrade, downgrade or cancel any time.</p>
          <div className="prices">
            <div className="price">
              <h3>Starter</h3>
              <div className="amt">£9<small>/month</small></div>
              <ul>
                <li>1,000 AI messages a month</li>
                <li>Your name, logo and colours</li>
                <li>Lead capture and email alerts</li>
                <li>WhatsApp button</li>
                <li>1 website</li>
              </ul>
              <Link href="/signup?plan=starter" className="btn ghost" style={{ width: "100%", textAlign: "center" }}>Choose Starter</Link>
            </div>
            <div className="price best">
              <h3>Pro</h3>
              <div className="amt">£19<small>/month</small></div>
              <ul>
                <li>5,000 AI messages a month</li>
                <li>Everything in Starter</li>
                <li>Use on several websites</li>
                <li>Chatbot replies inside WhatsApp (coming soon)</li>
                <li>Priority support</li>
              </ul>
              <Link href="/signup?plan=pro" className="btn" style={{ width: "100%", textAlign: "center" }}>Choose Pro</Link>
            </div>
          </div>
          <p className="compare">Most branded AI chatbots start from around £30 a month or charge per answer. LetsChat doesn't.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2>Questions</h2>
          <p className="sub">Anything else? Ask our own chatbot, or email info@creativedleading.co.uk.</p>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
      {demo ? <Script src="/widget.js" data-bot={demo} strategy="afterInteractive" /> : null}
    </>
  );
}
