"use client";

import { useState } from "react";
import type { PracticeConfig } from "@/types";

interface SiteHeaderProps {
  practiceName: string;
  branding: PracticeConfig["branding"];
  bookingUrl?: string;
}

export default function SiteHeader({ practiceName, branding, bookingUrl }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { colorPalette } = branding;

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200"
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Practice Name */}
        <a
          href="#"
          className="text-xl font-bold"
          style={{ color: colorPalette.primaryDark }}
        >
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={practiceName} className="h-8" />
          ) : (
            practiceName
          )}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: colorPalette.neutral }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colorPalette.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colorPalette.neutral)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={bookingUrl || "#contact"}
            className="text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: colorPalette.primary }}
          >
            Book Appointment
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: colorPalette.neutralDark }}
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium py-2"
                style={{ color: colorPalette.neutral }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={bookingUrl || "#contact"}
              className="text-white text-sm font-medium px-5 py-2.5 rounded-lg text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: colorPalette.primary }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Appointment
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
