import type { Provider, ColorPalette } from "@/types";

interface SiteAboutProps {
  provider: Provider;
  colorPalette: ColorPalette;
}

export default function SiteAbout({ provider, colorPalette }: SiteAboutProps) {
  const providerDisplayName = `Dr. ${provider.firstName} ${provider.lastName}, ${provider.credentials}`;

  return (
    <section id="about" className="py-20 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          About {providerDisplayName}
        </h2>
        {provider.title && (
          <p
            className="text-center mb-12 text-lg"
            style={{ color: colorPalette.primary }}
          >
            {provider.title}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Bio & Photo */}
          <div>
            {provider.photoUrl && (
              <img
                src={provider.photoUrl}
                alt={providerDisplayName}
                className="w-full max-w-sm mx-auto rounded-2xl mb-6 object-cover"
              />
            )}
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {provider.bio}
            </p>
            {provider.languages.length > 0 && (
              <div className="mt-6">
                <h4
                  className="text-sm font-semibold uppercase tracking-wider mb-2"
                  style={{ color: colorPalette.neutral }}
                >
                  Languages
                </h4>
                <p className="text-gray-600">{provider.languages.join(", ")}</p>
              </div>
            )}
          </div>

          {/* Right: Education & Certifications */}
          <div className="space-y-8">
            {/* Education */}
            {provider.education.length > 0 && (
              <div>
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
                          {edu.year && <span className="text-gray-500 ml-2">({edu.year})</span>}
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
            )}

            {/* Board Certifications */}
            {provider.boardCertifications.length > 0 && (
              <div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: colorPalette.neutralDark }}
                >
                  Board Certifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {provider.boardCertifications.map((cert, i) => (
                    <a
                      key={i}
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-current transition-colors text-center"
                      style={{ color: colorPalette.primary }}
                    >
                      {cert.badgeImageUrl ? (
                        <img
                          src={cert.badgeImageUrl}
                          alt={cert.board}
                          className="w-16 h-16 object-contain mb-2"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-2 text-white font-bold text-sm"
                          style={{ backgroundColor: colorPalette.primary }}
                        >
                          {cert.board.split(" ").map((w) => w[0]).join("").slice(0, 4)}
                        </div>
                      )}
                      <p className="text-xs font-semibold text-gray-900 group-hover:underline">
                        {cert.specialty}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Verify &rarr;
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
