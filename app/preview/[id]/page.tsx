import Script from "next/script";

export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="legal">
      <h1>Chatbot preview</h1>
      <p>This is how your chatbot looks on a website. Click the chat button in the bottom right corner to try it.</p>
      <p className="hint">Messages you send here count towards your monthly allowance. If nothing appears, check that your plan is active.</p>
      <p><a href="/dashboard">Back to dashboard</a></p>
      <Script src="/widget.js" data-bot={id} strategy="afterInteractive" />
    </div>
  );
}
