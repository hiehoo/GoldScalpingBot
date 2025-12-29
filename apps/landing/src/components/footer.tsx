"use client";

import { AlertTriangle, MessageCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { RISK_DISCLAIMER, TELEGRAM_LINK, SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-primary/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Risk Warning - Prominent */}
        <div className="bg-background/50 p-6 rounded-xl mb-10 border border-danger/20">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-danger font-semibold mb-2">Risk Disclosure</p>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {RISK_DISCLAIMER.full}
              </p>
            </div>
          </div>
        </div>

        {/* Footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="vip-badge">VIP</span>
              <span className="font-bold text-lg gradient-gold">{SITE_CONFIG.name}</span>
            </div>
            <p className="text-sm text-foreground-muted">
              Free Gold & NAS100 trading signals for South African traders. FSCA regulated. ZAR deposits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li>
                <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Join VIP Telegram
                </a>
              </li>
              <li>
                <a href="https://www.fsca.co.za" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  Verify FSCA Regulation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                PU Prime FSP Number: 49130
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                FSCA Regulated Broker
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-foreground-muted" />
                This is not financial advice
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-primary/10 text-center text-sm text-foreground-muted">
          <p>
            &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved. Trading involves risk.
          </p>
        </div>
      </div>
    </footer>
  );
}
