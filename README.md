# LetsChat

White-label AI chatbot for small businesses, by Dleading Creative Designs Ltd.
Businesses sign up, add their name, logo, colours and business info, pay monthly (Starter £9 for 1,000 messages, Pro £19 for 5,000), and paste one line of code into their website.

## What's inside

- **Product website**: `/` (home, pricing, FAQ), `/privacy`, `/terms`
- **Accounts**: `/signup`, `/login` (Supabase email and password)
- **Customer dashboard**: `/dashboard` for branding, business info, WhatsApp number, lead email, allowed domains, embed code, usage, leads and billing
- **Admin**: `/admin` lists every customer, plan, status and usage, plus monthly revenue (emails listed in `ADMIN_EMAILS`)
- **Embed script**: `public/widget.js`. Customers add `<script src="https://YOUR-DOMAIN/widget.js" data-bot="BOT_ID" defer></script>`
- **APIs**: `/api/chat` (Claude Haiku 5.5, monthly cap per plan), `/api/lead`, `/api/bot/[id]`, `/api/me/*`, `/api/stripe/*`, `/api/admin`

Stack: Next.js 15 on Vercel, Supabase (database, auth, logo storage), Stripe subscriptions, Anthropic API.

## Setup (about 30 minutes)

1. **Supabase**: create a project at supabase.com. In SQL Editor, run `supabase/schema.sql`. In Authentication > URL Configuration, set the Site URL to your app URL. Copy the URL, anon key and service role key from Project settings > API.
2. **Anthropic**: at console.anthropic.com, create a **new** API key just for LetsChat (keep it separate from the Dleading website's key) and set a monthly spend limit.
3. **Stripe**: create a product "LetsChat" with two monthly prices, £9 and £19, and copy both price IDs. In Developers > Webhooks, add `https://YOUR-DOMAIN/api/stripe/webhook` with the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`, then copy the signing secret. Turn on the Customer portal (Settings > Billing > Customer portal) and allow plan switching between the two prices.
4. **Vercel**: import this repo and add every variable from `.env.example`. Commercial use needs Vercel Pro.
5. Sign up on the live site with an admin email. Use the dashboard to make your own bot (for example a LetsChat demo bot), and put its id in `NEXT_PUBLIC_DEMO_BOT_ID` to show it on the homepage.

Optional: `RESEND_API_KEY` emails each new lead to the business, and `TRIAL_DAYS` adds a free trial.

## Running costs

About $0.001 per message on Claude Haiku 5.5, so 1,000 messages cost roughly 60p. Stripe takes about 1.5% + 20p per payment.

## Not built yet

- Pro feature: the bot replying inside WhatsApp (Meta WhatsApp Business Platform). The widget already shows a WhatsApp button on every plan.
- Per-visitor rate limiting beyond the monthly cap (each conversation is capped at 30 messages).
- Have the privacy and terms pages checked before launch.

## Local development

```
cp .env.example .env.local   # fill in values
npm install
npm run dev
```
