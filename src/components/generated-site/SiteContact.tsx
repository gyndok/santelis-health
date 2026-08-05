"use client";

import type { OfficeLocation, ColorPalette, IntakeForm } from "@/types";
import { formatOfficeHours } from "@/lib/site-format";
import { withAlpha } from "@/lib/color";

interface SiteContactProps {
  location: OfficeLocation;
  colorPalette: ColorPalette;
  bookingUrl?: string;
  practiceName: string;
  intakeForms?: IntakeForm[];
  languages?: string[];
}

export default function SiteContact({
  location,
  colorPalette,
  bookingUrl,
  practiceName,
  intakeForms,
  languages,
}: SiteContactProps) {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl font-bold mb-12 text-center"
          style={{ color: colorPalette.neutralDark }}
        >
          Contact &amp; Location
        </h2>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Info side */}
          <div>
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: colorPalette.neutralDark }}
            >
              {practiceName}
            </h3>

            <div className="space-y-4" style={{ color: colorPalette.neutral }}>
              {/* Address */}
              <div>
                <p
                  className="font-semibold text-sm uppercase tracking-wide mb-1"
                  style={{ color: colorPalette.neutralDark }}
                >
                  Address
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${location.address} ${location.city} ${location.state} ${location.zip}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: colorPalette.primaryDark }}
                >
                  {location.address}
                  <br />
                  {location.city}, {location.state} {location.zip}
                </a>
              </div>

              {/* Phone */}
              <div>
                <p
                  className="font-semibold text-sm uppercase tracking-wide mb-1"
                  style={{ color: colorPalette.neutralDark }}
                >
                  Phone
                </p>
                <a
                  href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                  className="hover:underline"
                  style={{ color: colorPalette.primaryDark }}
                >
                  {location.phone}
                </a>
              </div>

              {/* Fax */}
              {location.fax && (
                <div>
                  <p
                    className="font-semibold text-sm uppercase tracking-wide mb-1"
                    style={{ color: colorPalette.neutralDark }}
                  >
                    Fax
                  </p>
                  <p>{location.fax}</p>
                </div>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <div>
                  <p
                    className="font-semibold text-sm uppercase tracking-wide mb-1"
                    style={{ color: colorPalette.neutralDark }}
                  >
                    Languages
                  </p>
                  <p>{languages.join(", ")}</p>
                </div>
              )}

              {/* Office Hours */}
              <div>
                <p
                  className="font-semibold text-sm uppercase tracking-wide mb-1"
                  style={{ color: colorPalette.neutralDark }}
                >
                  Office Hours
                </p>
                <div className="text-sm space-y-1">
                  {formatOfficeHours(location.hours).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Intake Form Links — styled tags */}
            {intakeForms && intakeForms.length > 0 && (
              <div className="mt-8">
                <p
                  className="font-semibold text-sm uppercase tracking-wide mb-3"
                  style={{ color: colorPalette.neutralDark }}
                >
                  New Patient Forms
                </p>
                <div className="flex flex-col gap-2">
                  {intakeForms.map((form, i) => (
                    <a
                      key={i}
                      href={form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: withAlpha(colorPalette.primary, 0.1),
                        color: colorPalette.primaryDark,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = withAlpha(colorPalette.primary, 0.2);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = withAlpha(colorPalette.primary, 0.1);
                      }}
                    >
                      {form.name} &rarr;
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map side */}
          <div>
            {location.googleMapsEmbedUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-md h-80 md:h-full min-h-[320px]">
                <iframe
                  src={location.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${practiceName} Location`}
                />
              </div>
            ) : (
              <div className="w-full h-80 md:h-full min-h-[320px] rounded-2xl bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">{location.address}, {location.city}, {location.state} {location.zip}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
