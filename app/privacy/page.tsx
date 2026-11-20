import { Footer, Nav } from "../_components/site";

export default function Privacy() {
  return (
    <>
      <Nav />
      <div className="legal">
        <h1>Privacy policy</h1>
        <p>LetsChat is run by Dleading Creative Designs Ltd, 13 Sefton Avenue, Leeds LS11 7BA ("we").</p>
        <h3>Businesses using LetsChat</h3>
        <p>We store your email, chatbot settings and billing status. Payments are handled by Stripe; we never see your card details.</p>
        <h3>Website visitors who use a LetsChat chatbot</h3>
        <p>
          Chat messages are sent to our AI provider (Anthropic) to generate replies and are not used to train AI models. We don't store
          chat transcripts. If you choose to leave your details, they're shared with the business whose website you're on.
        </p>
        <h3>Your rights</h3>
        <p>You can ask us to see or delete your data at info@creativedleading.co.uk.</p>
      </div>
      <Footer />
    </>
  );
}
