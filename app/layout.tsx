import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LetsChat by Dleading | Your own AI chatbot from £9 a month",
  description:
    "Add an AI chatbot with your own name, logo and colours to your website in minutes. Answers customer questions 24/7 and collects leads. From £9 a month.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
