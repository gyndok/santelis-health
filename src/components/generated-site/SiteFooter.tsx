"use client";

import type { PracticeConfig, ColorPalette } from "@/types";

interface SiteFooterProps {
  practiceName: string;
  location: PracticeConfig["locations"][0];
  colorPalette: ColorPalette;
  socialMedia?: PracticeConfig["integrations"]["socialMedia"];
  providerName?: string;
  bookingUrl?: string;
}

export default function SiteFooter({
  practiceName,
  location,
  colorPalette,
  socialMedia,
  providerName,
  bookingUrl,
}: SiteFooterProps) {
  const footerBg = colorPalette.footerBg || colorPalette.neutralDark;
  const footerText = colorPalette.footerText || colorPalette.accent;

  return (
    <footer
      className="py-12"
      style={{ backgroundColor: footerBg, color: footerText }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Practice Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              {providerName || practiceName}
            </h3>
            {providerName && (
              <p className="text-sm">{practiceName}</p>
            )}
            <p className="text-sm">{location.address}</p>
            <p className="text-sm">
              {location.city}, {location.state} {location.zip}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Contact</h3>
            <p className="text-sm">
              Phone:{" "}
              <a
                href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                className="hover:text-white"
              >
                {location.phone}
              </a>
            </p>
            {location.fax && (
              <p className="text-sm">Fax: {location.fax}</p>
            )}
            {location.email && (
              <p className="text-sm">
                <a
                  href={`mailto:${location.email}`}
                  className="hover:text-white"
                >
                  {location.email}
                </a>
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Quick Links</h3>
            <div className="space-y-1">
              <a href="#about" className="block text-sm hover:text-white">
                About
              </a>
              <a href="#services" className="block text-sm hover:text-white">
                Services
              </a>
              <a href="#reviews" className="block text-sm hover:text-white">
                Reviews
              </a>
              {bookingUrl && (
                <a href={bookingUrl} className="block text-sm hover:text-white">
                  Book Appointment
                </a>
              )}
              {socialMedia?.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-white"
                >
                  Facebook
                </a>
              )}
              {socialMedia?.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm hover:text-white"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        <div
          className="border-t mt-8 pt-8 text-sm text-center"
          style={{ borderColor: colorPalette.neutral }}
        >
          &copy; {new Date().getFullYear()} {providerName || practiceName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
