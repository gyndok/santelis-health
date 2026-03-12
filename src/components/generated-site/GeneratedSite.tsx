import type { PracticeConfig } from "@/types";
import SiteHeader from "./SiteHeader";
import SiteHero from "./SiteHero";
import SiteAbout from "./SiteAbout";
import SiteServices from "./SiteServices";
import SiteReviews from "./SiteReviews";
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
          fontFamily: branding.fontFamily || "inherit",
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

      <SiteServices
        services={services}
        colorPalette={branding.colorPalette}
        practiceName={config.practiceName}
      />

      <SiteReviews
        reviews={reviews}
        colorPalette={branding.colorPalette}
        googleBusinessProfileId={integrations.googleBusinessProfileId}
      />

      <SiteContact
        location={primaryLocation}
        colorPalette={branding.colorPalette}
        bookingUrl={bookingUrl}
        practiceName={config.practiceName}
      />

      <SiteFooter
        practiceName={config.practiceName}
        location={primaryLocation}
        colorPalette={branding.colorPalette}
        socialMedia={integrations.socialMedia}
      />
    </div>
  );
}
