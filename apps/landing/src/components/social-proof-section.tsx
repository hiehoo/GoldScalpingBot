"use client";

import { TrendingUp, Scale, CheckCircle } from "lucide-react";
import { PROFIT_TIERS, SITE_CONFIG, RISK_DISCLAIMER } from "@/lib/constants";

export function SocialProofSection() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl md:text-4xl font-bold mb-4">
            Real Profits from <span className="gradient-gold">Real SA Traders</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Members report {SITE_CONFIG.avgProfit} monthly profits on average*
          </p>
        </div>

        {/* Win rate dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left: Stats */}
          <div className="card-glass p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 bg-accent rounded-full pulse-live" />
              <span className="text-accent font-medium">Live Performance</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-4xl md:text-5xl font-bold gradient-gold">{SITE_CONFIG.winRate}</div>
                <div className="text-foreground-muted">Win Rate</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold gradient-gold">{SITE_CONFIG.signalsThisMonth}</div>
                <div className="text-foreground-muted">Signals This Month</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-primary/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span>Gold (XAUUSD): 76% win rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span>NAS100: 69% win rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-accent" />
                  <span>Avg Risk-Reward: 1:2.5</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Transparent track record</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Profit tiers */}
          <div className="card-glass p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-6">Expected Monthly Profits*</h3>

            <div className="space-y-4">
              {PROFIT_TIERS.map((tier, index) => (
                <div
                  key={index}
                  className="bg-background/50 p-4 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{tier.label}</div>
                    <div className="text-sm text-foreground-muted">Starting capital: {tier.capital}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-accent">{tier.monthly}</div>
                    <div className="text-sm text-foreground-muted">per month</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-foreground-muted mt-6">
              *{RISK_DISCLAIMER.short}
            </p>
          </div>
        </div>

        {/* Member counter */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-secondary/50 px-8 py-4 rounded-full border border-primary/20">
            <div className="flex -space-x-3">
              {["TM", "LK", "SD", "JN", "PM"].map((initials, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold border-2 border-background"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="font-semibold">{SITE_CONFIG.memberCount} SA Traders</div>
              <div className="text-sm text-foreground-muted">Active in our community</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
