"use client";

import { Users, TrendingUp, Wallet, MessageCircle, ArrowRight } from "lucide-react";
import { SITE_CONFIG, HERO_STATS, TELEGRAM_LINK, URGENCY, CTA_PRIMARY } from "@/lib/constants";

const iconMap = {
  Users,
  TrendingUp,
  Wallet,
} as const;

export function HeroSection() {
  return (
    <section className="gradient-hero min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* VIP Badge + SA flag */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="vip-badge">VIP</span>
          <div className="inline-flex items-center gap-2 bg-secondary/60 px-4 py-2 rounded-full border border-primary/20">
            <span className="text-lg">🇿🇦</span>
            <span className="text-sm text-foreground-muted">{SITE_CONFIG.name}</span>
          </div>
        </div>

        {/* Main headline - Montserrat Bold */}
        <h1 className="font-[family-name:var(--font-montserrat)] text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight uppercase tracking-tight">
          SA Traders Making{" "}
          <span className="gradient-green">R3,200 - R8,500</span>
          <span className="gradient-gold">/Month</span>
          <br />
          <span className="text-foreground">From Our FREE Gold Signals</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-foreground-muted mb-10 max-w-2xl mx-auto">
          {SITE_CONFIG.subTagline}
        </p>

        {/* Stats row - Green profit highlights */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
          {HERO_STATS.map((stat, index) => {
            const IconComponent = iconMap[stat.icon as keyof typeof iconMap];
            const isProfit = stat.label.includes("Profit");
            return (
              <div
                key={index}
                className={`card-glass px-6 py-4 rounded-lg text-center min-w-[110px] ${isProfit ? 'profit-card' : ''}`}
              >
                <div className="flex justify-center mb-2">
                  <IconComponent className={`w-5 h-5 ${isProfit ? 'text-accent' : 'text-primary'}`} />
                </div>
                <div className={`text-xl md:text-2xl font-bold ${isProfit ? 'profit-number' : 'gradient-gold'}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-foreground-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Primary CTA - Neon Green */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-3 px-10 py-5 rounded-xl text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            {CTA_PRIMARY.text}
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-sm text-foreground-muted">
            {CTA_PRIMARY.subtext}
          </p>
        </div>

        {/* Urgency - Gold accent */}
        <p className="text-sm text-primary font-medium mb-8">
          {URGENCY.spots}
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-foreground-muted text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full pulse-live" />
            FSCA Regulated
          </span>
          <span className="text-primary">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full pulse-live" />
            ZAR Deposits
          </span>
          <span className="text-primary">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full pulse-live" />
            No Fees
          </span>
        </div>
      </div>
    </section>
  );
}
