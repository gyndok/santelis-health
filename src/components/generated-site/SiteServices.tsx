"use client";

import {
  Baby,
  Scissors,
  Heart,
  HeartPulse,
  Users,
  Scale,
  Microscope,
  Stethoscope,
  Brain,
  Eye,
  Syringe,
  Pill,
  Activity,
  Shield,
  Bone,
  Ear,
  Smile,
  Monitor,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { Service, ColorPalette } from "@/types";
import { withAlpha } from "@/lib/color";

const iconMap: Record<string, LucideIcon> = {
  Baby, Scissors, Heart, HeartPulse, Users, Scale, Microscope,
  Stethoscope, Brain, Eye, Syringe, Pill, Activity,
  Shield, Bone, Ear, Smile, Monitor, Thermometer,
};

interface SiteServicesProps {
  services: Service[];
  colorPalette: ColorPalette;
  practiceName: string;
}

export default function SiteServices({ services, colorPalette, practiceName }: SiteServicesProps) {
  const sectionBg = colorPalette.sectionAltBg || withAlpha(colorPalette.accent, 0.2);

  return (
    <section
      id="services"
      className="py-20"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl font-bold mb-4 text-center"
          style={{ color: colorPalette.neutralDark }}
        >
          Services &amp; Procedures
        </h2>
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{ color: colorPalette.neutral }}
        >
          Comprehensive care at {practiceName}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service) => {
            const isFeatured = service.featured;
            const IconComponent = service.iconName ? iconMap[service.iconName] : null;

            return (
              <div
                key={service.id}
                className="rounded-2xl p-6 transition-shadow hover:shadow-lg"
                style={
                  isFeatured
                    ? {
                        background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.primaryDark})`,
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "#ffffff",
                        border: `1px solid ${colorPalette.accent}`,
                      }
                }
              >
                {/* Icon with colored background */}
                {IconComponent ? (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: isFeatured
                        ? "rgba(255,255,255,0.2)"
                        : `${colorPalette.primary}1f`,
                    }}
                  >
                    <IconComponent
                      size={24}
                      strokeWidth={1.75}
                      style={{ color: isFeatured ? "#fff" : colorPalette.primary }}
                    />
                  </div>
                ) : service.icon ? (
                  <div className="text-3xl mb-3">{service.icon}</div>
                ) : null}

                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: isFeatured ? "#fff" : colorPalette.neutralDark }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: isFeatured ? "rgba(255,255,255,0.8)" : colorPalette.neutral }}
                >
                  {service.description}
                </p>
                {service.linkUrl && (
                  <a
                    href={service.linkUrl}
                    className="inline-block mt-4 text-sm font-semibold underline underline-offset-4"
                    style={{ color: isFeatured ? "#ffffff" : colorPalette.primary }}
                  >
                    Learn More &rarr;
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
