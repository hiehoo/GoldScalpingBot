// External links - configured via environment variables
export const TELEGRAM_LINK = process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/your_channel";
export const AFFILIATE_LINK = process.env.NEXT_PUBLIC_AFFILIATE_LINK || "https://puprime.com/register";

// Site content - Mzansi FX VIP branding
export const SITE_CONFIG = {
  name: "Mzansi FX VIP",
  tagline: "Free Forex Signals South Africa: SA Traders Making R3,200 - R8,500/Month",
  subTagline: "Join 2,847 traders from Johannesburg, Cape Town & Durban getting FREE Gold & NAS100 signals on Telegram. FSCA regulated. Deposit in ZAR.",
  memberCount: "2,847",
  winRate: "73%",
  signalsThisMonth: "500+",
  avgProfit: "R3,200 - R8,500",
} as const;

// Hero stats - use Lucide icon names
export const HERO_STATS = [
  { value: "2,847", label: "SA Members", icon: "Users" },
  { value: "73%", label: "Win Rate", icon: "TrendingUp" },
  { value: "R127K+", label: "Profits This Month", icon: "Wallet" },
] as const;

// Features with Lucide icon names
export const FEATURES = [
  {
    icon: "BarChart3",
    title: "100% Free Signals",
    description: "Gold (XAUUSD) & NAS100 forex signals delivered to your Telegram. No subscriptions, no hidden fees. South Africa's top trading signals.",
  },
  {
    icon: "Target",
    title: "73% Win Rate",
    description: "500+ signals monthly with transparent track record. Real results from Johannesburg, Cape Town & Durban traders.",
  },
  {
    icon: "BadgeCheck",
    title: "Trade in ZAR",
    description: "No conversion fees. Deposit from FNB, Capitec, Absa, or Standard Bank directly. Best forex trading in South Africa.",
  },
  {
    icon: "Shield",
    title: "FSCA Regulated",
    description: "PU Prime is fully regulated by South Africa's Financial Sector Conduct Authority. Trusted by SA traders.",
  },
  {
    icon: "Zap",
    title: "Instant Delivery",
    description: "Entry, SL, TP sent to your phone. Trade anywhere in South Africa, even during load shedding.",
  },
  {
    icon: "GraduationCap",
    title: "Beginner Friendly",
    description: "Never traded forex before? We show South African traders exactly how to place trades step-by-step.",
  },
] as const;

// Trust indicators - Lucide icon names
export const TRUST_POINTS = [
  {
    icon: "ShieldCheck",
    title: "FSCA Regulated",
    description: "Your money is protected by South Africa's Financial Sector Conduct Authority",
    detail: "FSP Number: 49130",
  },
  {
    icon: "Banknote",
    title: "Trade in Rands",
    description: "Deposit, trade, and withdraw in ZAR. No forex conversion fees eating your gains.",
    detail: "Zero conversion costs",
  },
  {
    icon: "Building2",
    title: "SA Bank Deposits",
    description: "FNB, Capitec, Absa, Standard Bank, Nedbank - all supported",
    detail: "Instant deposits",
  },
] as const;

// SA Banks for display
export const SA_BANKS = ["FNB", "Capitec", "Absa", "Standard Bank", "Nedbank"] as const;

// Testimonials - SA personas with image paths
export const TESTIMONIALS = [
  {
    name: "Thabo M.",
    location: "Sandton, Johannesburg",
    image: "/images/testimonials/thabo.jpg",
    profit: "+R2,100",
    period: "30 days",
    quote: "I thought forex was a scam. But I had R500 doing nothing in my Capitec, so I tried. First week I made R340. Last month I withdrew R2,100 – groceries and petrol sorted.",
    bank: "Capitec",
    type: "beginner",
  },
  {
    name: "Lindiwe K.",
    location: "Sea Point, Cape Town",
    image: "/images/testimonials/lindiwe.jpg",
    profit: "+R8,400",
    period: "6 weeks",
    quote: "Been trading 2 years, kept blowing accounts. These Gold signals changed everything. Turned R3,000 into R11,400. Now trading full-time.",
    bank: "FNB",
    type: "experienced",
  },
  {
    name: "Sipho D.",
    location: "Umlazi, Durban",
    image: "/images/testimonials/sipho.jpg",
    profit: "+R5,600",
    period: "30 days",
    quote: "I'm an electrician. No time for charts. Get the signal, place the trade at lunch, profit by evening. R5,600 last month. That's braai money.",
    bank: "FNB",
    type: "part-time",
  },
] as const;

// Profit tiers for social proof
export const PROFIT_TIERS = [
  { capital: "R500", monthly: "R800 - R2,100", label: "Starter" },
  { capital: "R2,000", monthly: "R3,200 - R6,400", label: "Active" },
  { capital: "R5,000+", monthly: "R8,500 - R18,000", label: "VIP" },
] as const;

// CTA variations - Neon Green action buttons
export const CTA_PRIMARY = {
  text: "Get My Free Signals Now",
  subtext: "Join 153 traders who signed up this week",
} as const;

export const CTA_SECONDARY = {
  text: "Open My Trading Account",
  subtext: "FSCA Regulated • 3 min setup",
} as const;

// Risk disclaimers
export const RISK_DISCLAIMER = {
  short: "Trading carries risk. Only trade money you can afford to lose. Past performance ≠ future results.",
  full: `Forex and CFD trading involves substantial risk of loss and is not suitable for all investors. All trading signals are for educational purposes only. We do not guarantee profits. Testimonials represent specific individual results and are not typical. Your results may vary. PU Prime is regulated by FSCA (FSP: 49130). Always trade responsibly.`,
} as const;

// FAQ - Objection handling
export const FAQ_OBJECTIONS = [
  {
    question: "Is this a scam? I've been burnt before.",
    answer: "We get it. Too many forex scammers out there. That's why we're 100% free - we only make money when you trade with our regulated broker partner. No upfront fees, ever.",
  },
  {
    question: "How much money do I need to start?",
    answer: "As little as R500. Many members start with R500-R1,000 from their Capitec and scale up after seeing results.",
  },
  {
    question: "What if I've never traded before?",
    answer: "Perfect. We send step-by-step tutorials with every signal. Just copy what we send. Takes 2 minutes per trade.",
  },
  {
    question: "Why is it free? What's the catch?",
    answer: "No catch. We earn a small commission from the broker when you open an account and trade. You pay nothing extra - broker spreads are the same. We only profit when you profit.",
  },
  {
    question: "Can I withdraw my profits to my SA bank?",
    answer: "Yes! Withdraw directly to FNB, Capitec, Absa, Standard Bank, or Nedbank. Most withdrawals arrive within 24-48 hours. No hidden fees.",
  },
] as const;

// Urgency messaging
export const URGENCY = {
  spots: "⚡ 47 traders joined today from Gauteng",
  nextSignal: "Next Gold signal in 2 hours - don't miss it",
  freeAccess: "Free VIP access ends when we hit 3,000 members",
} as const;
