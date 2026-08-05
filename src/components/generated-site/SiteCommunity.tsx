"use client";

import { Baby, Camera, Heart, Users, ArrowRight } from "lucide-react";
import type { ColorPalette } from "@/types";
import type { LucideIcon } from "lucide-react";

interface CommunityConfig {
  heading: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  features?: { label: string }[];
}

interface SiteCommunityProps {
  community: CommunityConfig;
  colorPalette: ColorPalette;
}

const featureIcons: LucideIcon[] = [Baby, Camera, Heart, Users];

export default function SiteCommunity({ community, colorPalette }: SiteCommunityProps) {
  const btnPrimaryBg = colorPalette.buttonPrimaryBg || colorPalette.primaryDark;
  const btnPrimaryText = colorPalette.buttonPrimaryText || "#ffffff";

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: `${colorPalette.accent}33` }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${colorPalette.primary}26` }}
          >
            <Baby
              className="w-8 h-8"
              style={{ color: colorPalette.primaryDark }}
            />
          </div>

          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: colorPalette.neutralDark }}
          >
            {community.heading}
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: colorPalette.neutral }}
          >
            {community.description}
          </p>

          {/* Feature grid */}
          {community.features && community.features.length > 0 && (
            <div className="grid grid-cols-3 gap-6 mb-10 max-w-md mx-auto">
              {community.features.map((feature, i) => {
                const Icon = featureIcons[i % featureIcons.length];
                return (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon
                        className="w-5 h-5 mr-1.5"
                        style={{ color: colorPalette.primary }}
                      />
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colorPalette.neutralDark }}
                    >
                      {feature.label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Button */}
          <a
            href={community.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: btnPrimaryBg,
              color: btnPrimaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colorPalette.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = btnPrimaryBg;
            }}
          >
            {community.ctaText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
