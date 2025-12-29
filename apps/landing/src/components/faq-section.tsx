"use client";

import { ChevronDown } from "lucide-react";
import { FAQ_OBJECTIONS } from "@/lib/constants";
import { useState } from "react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-3xl font-semibold mb-3">
            Got <span className="gradient-gold">Questions</span>?
          </h2>
          <p className="text-foreground-muted text-base">
            We know you've been burned before. Here's the honest truth.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_OBJECTIONS.map((faq, index) => (
            <div
              key={index}
              className="bg-secondary/40 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-secondary/60 transition-colors"
              >
                <span className="font-medium text-foreground text-sm">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-foreground-muted transition-transform flex-shrink-0 ml-3 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4">
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Casual closing note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground-muted">
            Still not sure? Just join the Telegram and watch for a week. Zero risk.
          </p>
        </div>
      </div>
    </section>
  );
}
