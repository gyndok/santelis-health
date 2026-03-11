import type { Service, ColorPalette } from "@/types";

interface SiteServicesProps {
  services: Service[];
  colorPalette: ColorPalette;
  practiceName: string;
}

export default function SiteServices({ services, colorPalette, practiceName }: SiteServicesProps) {
  return (
    <section
      id="services"
      className="py-20 md:py-24"
      style={{ backgroundColor: colorPalette.accent + "33" }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          Our Services
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Comprehensive care at {practiceName}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const isFeatured = service.featured;

            return (
              <div
                key={service.id}
                className="rounded-2xl p-6 transition-shadow hover:shadow-lg"
                style={
                  isFeatured
                    ? {
                        background: `linear-gradient(135deg, ${colorPalette.primary} 0%, ${colorPalette.primaryDark} 100%)`,
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }
                }
              >
                {isFeatured && (
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Featured
                  </span>
                )}
                {service.icon && (
                  <div className="text-3xl mb-3">{service.icon}</div>
                )}
                <h3
                  className="text-lg font-semibold mb-2"
                  style={isFeatured ? { color: "#ffffff" } : { color: colorPalette.neutralDark }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={isFeatured ? { color: "rgba(255,255,255,0.85)" } : { color: "#6b7280" }}
                >
                  {service.description}
                </p>
                {service.linkUrl && (
                  <a
                    href={service.linkUrl}
                    className="inline-block mt-4 text-sm font-medium underline"
                    style={isFeatured ? { color: "#ffffff" } : { color: colorPalette.primary }}
                  >
                    Learn more &rarr;
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
