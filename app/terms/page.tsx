import { Footer, Nav } from "../_components/site";

export default function Terms() {
  return (
    <>
      <Nav />
      <div className="legal">
        <h1>Terms of service</h1>
        <p>LetsChat is provided by Dleading Creative Designs Ltd, 13 Sefton Avenue, Leeds LS11 7BA.</p>
        <ul>
          <li>Plans are billed monthly in advance through Stripe. You can cancel any time; your plan stays active until the end of the paid month.</li>
          <li>Each plan includes a monthly number of AI messages. When you reach it, the chatbot keeps collecting visitor details until the next month or until you upgrade.</li>
          <li>You're responsible for the business information you add. The chatbot answers from that information, but AI can make mistakes, so don't rely on it for legal, medical or financial advice.</li>
          <li>Don't use LetsChat for anything unlawful, misleading or abusive. We may suspend accounts that do.</li>
        </ul>
        <p>Questions: info@creativedleading.co.uk</p>
      </div>
      <Footer />
    </>
  );
}
