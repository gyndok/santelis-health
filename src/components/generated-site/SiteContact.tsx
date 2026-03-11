import type { OfficeLocation, ColorPalette } from "@/types";

interface SiteContactProps {
  location: OfficeLocation;
  colorPalette: ColorPalette;
  bookingUrl?: string;
  practiceName: string;
}

export default function SiteContact({
  location,
  colorPalette,
  bookingUrl,
  practiceName,
}: SiteContactProps) {
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;

  const days: { key: keyof typeof location.hours; label: string }[] = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <section
      id="contact"
      className="py-20 md:py-24"
      style={{ backgroundColor: colorPalette.accent + "33" }}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ color: colorPalette.neutralDark }}
        >
          Contact Us
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left: Info */}
          <div className="space-y-8">
            {/* Address */}
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: colorPalette.neutral }}
              >
                Location
              </h3>
              <p className="text-gray-800 font-medium">{practiceName}</p>
              {location.name && (
                <p className="text-gray-600 text-sm">{location.name}</p>
              )}
              <p className="text-gray-600">{location.address}</p>
              <p className="text-gray-600">
                {location.city}, {location.state} {location.zip}
              </p>
            </div>

            {/* Phone & Email */}
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: colorPalette.neutral }}
              >
                Phone
              </h3>
              <a
                href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                className="text-lg font-medium hover:underline"
                style={{ color: colorPalette.primary }}
              >
                {location.phone}
              </a>
              {location.fax && (
                <p className="text-gray-500 text-sm mt-1">
                  Fax: {location.fax}
                </p>
              )}
              {location.email && (
                <div className="mt-3">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-1"
                    style={{ color: colorPalette.neutral }}
                  >
                    Email
                  </h3>
                  <a
                    href={`mailto:${location.email}`}
                    className="text-sm hover:underline"
                    style={{ color: colorPalette.primary }}
                  >
                    {location.email}
                  </a>
                </div>
              )}
            </div>

            {/* Office Hours */}
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: colorPalette.neutral }}
              >
                Office Hours
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {days.map(({ key, label }) => {
                    const hours = location.hours[key];
                    return (
                      <tr key={key} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-700 w-32">
                          {label}
                        </td>
                        <td className="py-2 text-gray-600">
                          {hours || "Closed"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CTA */}
            <a
              href={bookingUrl || "#"}
              className="inline-block text-white font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90 text-center"
              style={{ backgroundColor: colorPalette.primary }}
            >
              Book an Appointment
            </a>
          </div>

          {/* Right: Map */}
          <div>
            {location.googleMapsEmbedUrl ? (
              <iframe
                src={location.googleMapsEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
                title={`Map of ${practiceName}`}
              />
            ) : (
              <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-sm">{fullAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
