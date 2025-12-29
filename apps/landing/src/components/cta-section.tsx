"use client";

import { MessageCircle, TrendingUp, ArrowRight } from "lucide-react";
import { TELEGRAM_LINK, AFFILIATE_LINK, CTA_PRIMARY, CTA_SECONDARY, URGENCY, SITE_CONFIG } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-background relative">
      {/* Subtle gold glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <span className="vip-badge mb-4 inline-block">VIP ACCESS</span>

        <h2 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-4xl font-bold mb-5 uppercase">
          Ready to Start <span className="gradient-green">Making Rands</span>?
        </h2>
        <p className="text-foreground-muted text-base mb-6 max-w-xl mx-auto">
          Join {SITE_CONFIG.memberCount} South Africans getting free Gold & NAS100 signals on Telegram
        </p>

        {/* Urgency - Gold text */}
        <p className="text-sm text-primary font-medium mb-8">
          {URGENCY.freeAccess}
        </p>

        {/* CTAs - Neon Green primary, Gold secondary */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          {/* Primary CTA - Neon Green */}
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            <span>{CTA_PRIMARY.text}</span>
            <ArrowRight className="w-5 h-5" />
          </a>

          {/* Secondary CTA - Gold border */}
          <a
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-lg"
          >
            <TrendingUp className="w-6 h-6" />
            <span>{CTA_SECONDARY.text}</span>
          </a>
        </div>

        {/* Trust indicators with green dots */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-foreground-muted text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            FSCA Regulated
          </span>
          <span className="text-primary">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            ZAR Deposits
          </span>
          <span className="text-primary">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full" />
            100% Free
          </span>
        </div>
      </div>
    </section>
  );
}
