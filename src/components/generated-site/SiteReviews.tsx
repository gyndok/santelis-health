"use client";

import type { Review, ColorPalette } from "@/types";
import { starString, initials, formatReviewDate } from "@/lib/site-format";
import { withAlpha } from "@/lib/color";

interface SiteReviewsProps {
  reviews: Review[];
  colorPalette: ColorPalette;
  googleBusinessProfileId?: string;
  googleReviewUrl?: string;
}

export default function SiteReviews({
  reviews,
  colorPalette,
  googleBusinessProfileId,
  googleReviewUrl,
}: SiteReviewsProps) {
  if (reviews.length === 0) return null;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const sectionBg = colorPalette.sectionAltBg || withAlpha(colorPalette.accent, 0.3);
  const btnPrimaryBg = colorPalette.buttonPrimaryBg || colorPalette.primaryDark;
  const btnPrimaryText = colorPalette.buttonPrimaryText || "#ffffff";
  const btnSecBorder = colorPalette.buttonSecondaryBorder || colorPalette.neutral;
  const btnSecText = colorPalette.buttonSecondaryText || colorPalette.neutral;

  const reviewLink = googleReviewUrl
    || (googleBusinessProfileId
      ? `https://search.google.com/local/writereview?placeid=${googleBusinessProfileId}`
      : null);
  const allReviewsLink = googleBusinessProfileId
    ? `https://search.google.com/local/reviews?placeid=${googleBusinessProfileId}`
    : null;

  return (
    <section
      id="reviews"
      className="py-20"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Aggregate Rating */}
        <div className="mb-8">
          <span
            className="text-5xl font-bold"
            style={{ color: colorPalette.neutralDark }}
          >
            {avgRating.toFixed(1)}
          </span>
          <div className="text-2xl mt-1" style={{ color: colorPalette.primary }}>
            {starString(avgRating)}
          </div>
          <p className="text-sm mt-2" style={{ color: colorPalette.neutral }}>
            Based on {reviews.length} Google review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Review Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-10">
          {reviews.slice(0, 8).map((review, i) => (
            <div key={i} className="bg-white rounded-xl p-5 text-left shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: withAlpha(colorPalette.primary, 0.2),
                    color: colorPalette.primaryDark,
                  }}
                >
                  {initials(review.authorName)}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: colorPalette.neutralDark }}
                  >
                    {review.authorName}
                  </p>
                  <p className="text-xs" style={{ color: colorPalette.neutral }}>
                    {formatReviewDate(review.date)}
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: colorPalette.neutral }}>
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reviewLink && (
            <a
              href={reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="site-btn-primary inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors"
              style={
                {
                  "--btn-bg": btnPrimaryBg,
                  "--btn-hover-bg": colorPalette.primary,
                  color: btnPrimaryText,
                } as React.CSSProperties
              }
            >
              Leave a Review &rarr;
            </a>
          )}
          {allReviewsLink && (
            <a
              href={allReviewsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="site-btn-secondary inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold border-2 transition-colors"
              style={
                {
                  "--btn-hover-bg": btnSecBorder,
                  borderColor: btnSecBorder,
                  color: btnSecText,
                } as React.CSSProperties
              }
            >
              Read All Reviews
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
