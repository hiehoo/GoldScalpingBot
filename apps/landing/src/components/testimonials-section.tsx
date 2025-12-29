"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

// Card rotations for organic feel
const cardRotations = [
  "rotate-slight-left",
  "rotate-tiny-right",
  "rotate-slight-right",
];

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-3xl font-semibold mb-3">
            Hear from <span className="gradient-gold">SA Traders</span> Like You
          </h2>
          <p className="text-foreground-muted text-base max-w-xl mx-auto">
            Real stories from real South Africans... making real Rands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className={`testimonial-card bg-background/50 p-5 rounded-xl border border-primary/5 ${cardRotations[index]}`}
            >
              {/* Header with photo */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/20">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-xs text-foreground-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {testimonial.location}
                  </div>
                </div>
              </div>

              {/* Quote - more casual with natural pauses */}
              <p className="text-foreground-muted mb-5 leading-relaxed text-sm">
                "{testimonial.quote}"
              </p>

              {/* Profit badge - simpler */}
              <div className="flex items-center justify-between">
                <div className="bg-accent/10 text-accent px-3 py-1.5 rounded-lg">
                  <span className="font-semibold">{testimonial.profit}</span>
                  <span className="text-xs ml-1 opacity-80">in {testimonial.period}</span>
                </div>
                <div className="text-xs text-foreground-muted">
                  via {testimonial.bank}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note - less formal */}
        <p className="text-center text-xs text-foreground-muted mt-8 max-w-lg mx-auto">
          *Individual results vary. Trading carries risk. Only trade what you can afford to lose.
        </p>
      </div>
    </section>
  );
}
