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
  const providerDisplayName = `Dr. ${provider.firstName} ${provider.lastName}, ${provider.credentials}`;

  return (
    <section className="relative overflow-hidden">
      {/* Background: image with Ken Burns or gradient fallback */}
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

      {/* Content */}
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
            {provider.title && (
              <>
                <br />
                <span className="text-base text-white/60">{provider.title}</span>
              </>
            )}
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

      {/* Ken Burns keyframes */}
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
