"use client";

import { BarChart3, Target, BadgeCheck, Shield, Zap, GraduationCap } from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap = {
  BarChart3,
  Target,
  BadgeCheck,
  Shield,
  Zap,
  GraduationCap,
} as const;

// Slight rotations for less perfect grid
const cardRotations = [
  "rotate-tiny-right",
  "",
  "rotate-tiny-left",
  "rotate-tiny-left",
  "",
  "rotate-tiny-right",
];

export function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-montserrat)] text-2xl md:text-3xl font-semibold mb-3">
            Why <span className="gradient-gold">2,847 SA Traders</span> Joined
          </h2>
          <p className="text-foreground-muted text-base max-w-xl mx-auto">
            Everything you need to start making extra cash from trading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div
                key={index}
                className={`card-glass p-5 rounded-xl ${cardRotations[index]}`}
              >
                <div className="mb-3">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-medium mb-1.5">{feature.title}</h3>
                <p className="text-foreground-muted text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
