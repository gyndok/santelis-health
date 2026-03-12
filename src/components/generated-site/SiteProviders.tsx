import type { Provider, ColorPalette } from "@/types";

interface SiteProvidersProps {
  providers: Provider[];
  colorPalette: ColorPalette;
  bookingUrl?: string;
}

export default function SiteProviders({
  providers,
  colorPalette,
  bookingUrl,
}: SiteProvidersProps) {
  // Skip if 0 or 1 provider (About section handles single provider)
  if (providers.length <= 1) return null;

  return (
    <section id="providers" className="py-20 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          Our Providers
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Meet our team of experienced healthcare professionals
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              colorPalette={colorPalette}
            />
          ))}
        </div>

        {bookingUrl && (
          <div className="text-center mt-10">
            <a
              href={bookingUrl}
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-lg text-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: colorPalette.primary }}
            >
              Book an Appointment
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ProviderCard({
  provider,
  colorPalette,
}: {
  provider: Provider;
  colorPalette: ColorPalette;
}) {
  const displayName = `Dr. ${provider.firstName} ${provider.lastName}`;
  const initials = `${provider.firstName[0]}${provider.lastName[0]}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-lg transition-shadow">
      {provider.photoUrl ? (
        <img
          src={provider.photoUrl}
          alt={displayName}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />
      ) : (
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: colorPalette.primary }}
        >
          {initials}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
      <p className="text-sm text-gray-500">{provider.credentials}</p>
      {provider.title && (
        <p className="text-sm mt-1" style={{ color: colorPalette.primary }}>
          {provider.title}
        </p>
      )}

      {provider.bio && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {provider.bio}
        </p>
      )}

      {provider.languages.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {provider.languages.join(" · ")}
        </p>
      )}
    </div>
  );
}
