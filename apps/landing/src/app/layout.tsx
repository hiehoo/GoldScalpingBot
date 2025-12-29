import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";

// Montserrat - Strong, tall headings (TikTok/Reels ready)
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Roboto - Easy to read on mobile
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Free Forex Signals South Africa | Gold & NAS100 Trading | Mzansi FX VIP",
  description: "Get FREE forex trading signals for Gold (XAUUSD) & NAS100 delivered to Telegram. 73% win rate. Join 2,847+ South African traders. FSCA regulated broker. ZAR deposits from FNB, Capitec, Absa.",
  keywords: [
    "forex signals South Africa",
    "free forex signals",
    "gold trading signals",
    "XAUUSD signals",
    "NAS100 signals",
    "South Africa forex",
    "FSCA regulated forex",
    "ZAR forex trading",
    "Johannesburg forex",
    "Cape Town trading signals",
    "Mzansi FX",
    "free trading signals Telegram"
  ],
  openGraph: {
    title: "Free Forex Signals SA | 73% Win Rate | Mzansi FX VIP",
    description: "Join 2,847+ SA traders getting FREE Gold & NAS100 signals daily. FSCA regulated. ZAR deposits.",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Forex Signals South Africa | Mzansi FX VIP",
    description: "Get FREE forex signals for Gold & NAS100. 73% win rate. Join 2,847+ SA traders.",
  },
  alternates: {
    canonical: "https://mzansifxvip.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for FAQ rich snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Mzansi FX VIP a scam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. We're 100% free - we only make money when you trade with our FSCA regulated broker partner. No upfront fees, ever."
      }
    },
    {
      "@type": "Question",
      "name": "How much money do I need to start forex trading in South Africa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "As little as R500. Many members start with R500-R1,000 from their Capitec and scale up after seeing results."
      }
    },
    {
      "@type": "Question",
      "name": "What if I've never traded forex before?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Perfect. We send step-by-step tutorials with every signal. Just copy what we send. Takes 2 minutes per trade."
      }
    },
    {
      "@type": "Question",
      "name": "Why is it free? What's the catch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No catch. We earn a small commission from the broker when you open an account and trade. You pay nothing extra - broker spreads are the same. We only profit when you profit."
      }
    },
    {
      "@type": "Question",
      "name": "Can I withdraw my profits to my South African bank?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Withdraw directly to FNB, Capitec, Absa, Standard Bank, or Nedbank. Most withdrawals arrive within 24-48 hours. No hidden fees."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${montserrat.variable} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
