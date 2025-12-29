"use client";

import { ShieldCheck, Banknote, Building2 } from "lucide-react";
import { TRUST_POINTS, SA_BANKS } from "@/lib/constants";

const iconMap = {
  ShieldCheck,
  Banknote,
  Building2,
} as const;

export function TrustSection() {
  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl md:text-4xl font-bold mb-4">
            Built for <span className="gradient-gold">South African Traders</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            No dodgy offshore brokers. Trade with a fully regulated, ZAR-friendly platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {TRUST_POINTS.map((point, index) => {
            const IconComponent = iconMap[point.icon as keyof typeof iconMap];
            return (
              <div
                key={index}
                className="bg-background/50 p-8 rounded-2xl text-center border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                <p className="text-foreground-muted mb-4">{point.description}</p>
                <div className="inline-block bg-accent/10 text-accent text-sm font-medium px-4 py-2 rounded-full">
                  {point.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* SA Banks section */}
        <div className="bg-background/30 rounded-2xl p-8 text-center">
          <p className="text-foreground-muted mb-6">Deposit directly from your SA bank account</p>
          <div className="flex flex-wrap justify-center gap-4">
            {SA_BANKS.map((bank, index) => (
              <div
                key={index}
                className="bg-background/60 px-6 py-3 rounded-xl border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <span className="font-semibold text-foreground">{bank}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-accent mt-6">
            ✓ Instant deposits • ✓ No conversion fees • ✓ Withdraw to same account
          </p>
        </div>
      </div>
    </section>
  );
}
