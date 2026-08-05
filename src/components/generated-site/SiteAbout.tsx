"use client";

import type { Provider, ColorPalette } from "@/types";

interface SiteAboutProps {
  provider: Provider;
  colorPalette: ColorPalette;
}

export default function SiteAbout({ provider, colorPalette }: SiteAboutProps) {
  const providerDisplayName = `Dr. ${provider.firstName} ${provider.lastName}`;

  // Build credential badges from board certs + education highlights
  const badges: { title: string; subtitle: string }[] = provider.boardCertifications.map((cert) => ({
    title: cert.board === cert.specialty ? cert.board : cert.board,
    subtitle: cert.specialty,
  }));

  // Add notable education items as badges (e.g., Chief Resident)
  provider.education.forEach((edu) => {
    if (edu.honors && edu.honors.toLowerCase().includes("chief")) {
      badges.push({ title: "Chief Resident", subtitle: edu.institution });
    }
  });

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl font-bold mb-12 text-center"
          style={{ color: colorPalette.neutralDark }}
        >
          About {providerDisplayName}
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 items-start">
          {/* Left: bio + badges (2 cols) */}
          <div className="md:col-span-2">
            <div className="space-y-4 mb-10" style={{ color: colorPalette.neutral }}>
              {provider.bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {provider.title && (
                <p
                  className="text-xl italic text-center mt-8"
                  style={{ color: colorPalette.primary }}
                >
                  &ldquo;{provider.title.includes("|")
                    ? provider.title.split("|")[0].trim()
                    : provider.title}&rdquo;
                </p>
              )}
            </div>

            {/* Credential badges — 2x2 grid */}
            {badges.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: `${colorPalette.accent}4d` }}
                  >
                    <p
                      className="font-bold text-sm"
                      style={{ color: colorPalette.primaryDark }}
                    >
                      {badge.title}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: colorPalette.neutral }}
                    >
                      {badge.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Board certification logos */}
            {provider.boardCertifications.some((c) => c.badgeImageUrl) && (
              <div className="flex items-center gap-8">
                {provider.boardCertifications
                  .filter((cert) => cert.badgeImageUrl)
                  .map((cert, i) => (
                    <a
                      key={i}
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={cert.badgeImageUrl}
                        alt={`${cert.board} - ${cert.specialty}`}
                        className="h-24 md:h-28 w-auto"
                      />
                    </a>
                  ))}
              </div>
            )}

            {/* Languages */}
            {provider.languages.length > 0 && (
              <div className="mt-6">
                <p
                  className="font-semibold text-sm uppercase tracking-wide mb-1"
                  style={{ color: colorPalette.neutralDark }}
                >
                  Languages
                </p>
                <p style={{ color: colorPalette.neutral }}>
                  {provider.languages.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Right: sidebar photo or education */}
          <div className="hidden md:block">
            {provider.photoUrl ? (
              <div
                className="rounded-2xl overflow-hidden shadow-md sticky top-8"
                style={{ height: "480px" }}
              >
                <img
                  src={provider.photoUrl}
                  alt={providerDisplayName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : provider.education.length > 0 ? (
              <div className="sticky top-8 space-y-6">
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: colorPalette.neutralDark }}
                >
                  Education & Training
                </h3>
                <ul className="space-y-3">
                  {provider.education.map((edu, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: colorPalette.primary }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {edu.degree}
                        </p>
                        <p className="text-gray-600 text-sm">{edu.institution}</p>
                        {edu.honors && (
                          <p className="text-sm italic" style={{ color: colorPalette.primary }}>
                            {edu.honors}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
