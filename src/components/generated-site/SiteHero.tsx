"use client";

import type { Provider, ColorPalette } from "@/types";

interface SiteHeroProps {
  practiceName: string;
  tagline?: string;
  provider: Provider;
  colorPalette: ColorPalette;
  phone: string;
  bookingUrl?: string;
  heroImageUrl?: string;
}

export default function SiteHero({
  practiceName,
  tagline,
  provider,
  colorPalette,
  phone,
  bookingUrl,
  heroImageUrl,
}: SiteHeroProps) {
  const providerDisplayName = `${provider.firstName} ${provider.lastName}, ${provider.credentials}`;
  const btnPrimaryBg = colorPalette.buttonPrimaryBg || colorPalette.primaryDark;
  const btnPrimaryText = colorPalette.buttonPrimaryText || "#ffffff";
  const btnSecBorder = colorPalette.buttonSecondaryBorder || colorPalette.primary;
  const btnSecText = colorPalette.buttonSecondaryText || colorPalette.primary;

  // If provider has a photo, use split layout (light background, photo on right)
  // Otherwise use full-width gradient hero
  const hasDoctorPhoto = !!provider.photoUrl;

  if (hasDoctorPhoto) {
    return (
      <section
        className="relative min-h-[500px] flex items-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, #fff 0%, ${colorPalette.accent}40 100%)` }}
      >
        {heroImageUrl && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.25,
            }}
          />
        )}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text side */}
            <div className="flex-1 max-w-xl text-center md:text-center">
              {provider.title && (
                <p
                  className="text-sm font-semibold tracking-widest uppercase mb-3"
                  style={{ color: colorPalette.primary }}
                >
                  {provider.title.length > 60
                    ? provider.title.split("|").map((s) => s.trim()).join(" & ")
                    : provider.title}
                </p>
              )}
              <h1
                className="text-4xl md:text-5xl font-bold leading-tight mb-4"
                style={{ color: colorPalette.neutralDark }}
              >
                {providerDisplayName}
              </h1>
              {tagline && (
                <p
                  className="italic text-lg mb-8"
                  style={{ color: colorPalette.primary }}
                >
                  &ldquo;{tagline}&rdquo;
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={bookingUrl || "#appointment"}
                  className="site-btn-primary inline-flex items-center justify-center font-semibold px-8 py-3 rounded-lg transition-colors"
                  style={
                    {
                      "--btn-bg": btnPrimaryBg,
                      "--btn-hover-bg": colorPalette.primary,
                      color: btnPrimaryText,
                    } as React.CSSProperties
                  }
                >
                  Book Appointment
                </a>
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="site-btn-secondary inline-flex items-center justify-center font-semibold px-8 py-3 rounded-lg border-2 transition-colors"
                  style={
                    {
                      "--btn-hover-bg": btnSecBorder,
                      borderColor: btnSecBorder,
                      color: btnSecText,
                    } as React.CSSProperties
                  }
                >
                  Call {phone}
                </a>
              </div>
            </div>

            {/* Photo side */}
            <div className="flex-shrink-0">
              <div className="w-64 h-80 md:w-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={provider.photoUrl}
                  alt={providerDisplayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback: full-width gradient hero (no doctor photo)
  return (
    <section className="relative overflow-hidden">
      {heroImageUrl ? (
        <>
          <div
            className="absolute inset-0 animate-ken-burns"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${colorPalette.primary}cc 0%, ${colorPalette.primaryDark}cc 100%)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colorPalette.primary} 0%, ${colorPalette.primaryDark} 100%)`,
          }}
        />
      )}

      <div className="relative py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {practiceName}
          </h1>
          {tagline && (
            <p
              className="text-lg md:text-xl mb-4 font-medium"
              style={{ color: colorPalette.accent }}
            >
              {tagline}
            </p>
          )}
          <p className="text-lg md:text-xl text-white/80 mb-10">
            {providerDisplayName}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={bookingUrl || "#contact"}
              className="font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90 text-lg inline-flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#ffffff",
                color: colorPalette.primaryDark,
              }}
            >
              Book Appointment
            </a>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="border-2 border-white/40 text-white hover:border-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg text-center"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.0); }
        }
        .animate-ken-burns {
          animation: kenBurns 20s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
