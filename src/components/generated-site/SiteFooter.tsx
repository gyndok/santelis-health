import type { PracticeConfig, ColorPalette } from "@/types";

interface SiteFooterProps {
  practiceName: string;
  location: PracticeConfig["locations"][0];
  colorPalette: ColorPalette;
  socialMedia?: PracticeConfig["integrations"]["socialMedia"];
}

export default function SiteFooter({
  practiceName,
  location,
  colorPalette,
  socialMedia,
}: SiteFooterProps) {
  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer
      className="py-12"
      style={{ backgroundColor: colorPalette.neutralDark, color: "#9ca3af" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Practice Info */}
          <div>
            <p className="text-lg font-bold text-white mb-2">{practiceName}</p>
            <p className="text-sm">{location.address}</p>
            <p className="text-sm">
              {location.city}, {location.state} {location.zip}
            </p>
            <a
              href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
              className="text-sm hover:text-white transition-colors mt-2 inline-block"
              style={{ color: colorPalette.accent }}
            >
              {location.phone}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Navigation
            </p>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <p className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Connect
            </p>
            <div className="flex flex-wrap gap-3">
              {socialMedia?.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Facebook
                </a>
              )}
              {socialMedia?.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Instagram
                </a>
              )}
              {socialMedia?.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  YouTube
                </a>
              )}
              {socialMedia?.twitter && (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Twitter
                </a>
              )}
              {socialMedia?.linkedin && (
                <a
                  href={socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
            {location.email && (
              <a
                href={`mailto:${location.email}`}
                className="text-sm hover:text-white transition-colors mt-3 inline-block"
              >
                {location.email}
              </a>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} {practiceName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Powered by{" "}
            <a
              href="https://santelishealth.com"
              className="hover:text-white transition-colors"
              style={{ color: colorPalette.accent }}
            >
              Santelis Health
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
