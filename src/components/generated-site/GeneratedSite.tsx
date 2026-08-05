import type { PracticeConfig } from "@/types";
import SiteHeader from "./SiteHeader";
import SiteHero from "./SiteHero";
import SiteAbout from "./SiteAbout";
import SiteProviders from "./SiteProviders";
import SiteServices from "./SiteServices";
import SiteCommunity from "./SiteCommunity";
import SiteReviews from "./SiteReviews";
import SiteAppointmentForm from "./SiteAppointmentForm";
import SiteContact from "./SiteContact";
import SiteFooter from "./SiteFooter";

interface GeneratedSiteProps {
  config: PracticeConfig;
}

export default function GeneratedSite({ config }: GeneratedSiteProps) {
  const { branding, providers, services, locations, reviews, integrations } = config;
  const primaryProvider = providers[0];
  const primaryLocation = locations[0];
  const bookingUrl = integrations.appointmentBooking?.url;
  const providerName = `${primaryProvider.firstName} ${primaryProvider.lastName}, ${primaryProvider.credentials}`;

  return (
    <div
      className="min-h-screen bg-white"
      style={
        {
          "--site-primary": branding.colorPalette.primary,
          "--site-primary-dark": branding.colorPalette.primaryDark,
          "--site-accent": branding.colorPalette.accent,
          "--site-neutral": branding.colorPalette.neutral,
          "--site-neutral-dark": branding.colorPalette.neutralDark,
          fontFamily: branding.fontFamily || "Inter, system-ui, -apple-system, sans-serif",
        } as React.CSSProperties
      }
    >
      <SiteHeader
        practiceName={config.practiceName}
        branding={branding}
        bookingUrl={bookingUrl}
      />

      <SiteHero
        practiceName={config.practiceName}
        tagline={branding.tagline}
        provider={primaryProvider}
        colorPalette={branding.colorPalette}
        phone={primaryLocation.phone}
        bookingUrl={bookingUrl}
        heroImageUrl={branding.heroImageUrl}
      />

      <SiteAbout
        provider={primaryProvider}
        colorPalette={branding.colorPalette}
      />

      <SiteProviders
        providers={providers}
        colorPalette={branding.colorPalette}
        bookingUrl={bookingUrl}
      />

      <SiteServices
        services={services}
        colorPalette={branding.colorPalette}
        practiceName={config.practiceName}
      />

      {integrations.community && (
        <SiteCommunity
          community={integrations.community}
          colorPalette={branding.colorPalette}
        />
      )}

      <SiteReviews
        reviews={reviews}
        colorPalette={branding.colorPalette}
        googleBusinessProfileId={integrations.googleBusinessProfileId}
      />

      <SiteAppointmentForm
        practiceId={config.id}
        colorPalette={branding.colorPalette}
        practiceName={config.practiceName}
      />

      <SiteContact
        location={primaryLocation}
        colorPalette={branding.colorPalette}
        bookingUrl={bookingUrl}
        practiceName={config.practiceName}
        intakeForms={integrations.intakeForms}
        languages={primaryProvider.languages}
      />

      <SiteFooter
        practiceName={config.practiceName}
        location={primaryLocation}
        colorPalette={branding.colorPalette}
        socialMedia={integrations.socialMedia}
        providerName={providerName}
        bookingUrl={bookingUrl}
      />
    </div>
  );
}
