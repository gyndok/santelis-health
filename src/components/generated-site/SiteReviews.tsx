"use client";

import { useState, useEffect, useCallback } from "react";
import type { Review, ColorPalette } from "@/types";

interface SiteReviewsProps {
  reviews: Review[];
  colorPalette: ColorPalette;
  googleBusinessProfileId?: string;
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-5 h-5"
          fill={star <= Math.round(rating) ? color : "#d1d5db"}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function SiteReviews({
  reviews,
  colorPalette,
  googleBusinessProfileId,
}: SiteReviewsProps) {
  if (reviews.length === 0) return null;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(((index % reviews.length) + reviews.length) % reviews.length);
    },
    [reviews.length]
  );

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, reviews.length]);

  return (
    <section id="reviews" className="py-20 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          Patient Reviews
        </h2>

        {/* Aggregate Rating */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-4xl font-bold"
              style={{ color: colorPalette.primaryDark }}
            >
              {avgRating.toFixed(1)}
            </span>
            <StarRating rating={avgRating} color={colorPalette.primary} />
          </div>
          <p className="text-gray-500 text-sm">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-2xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Arrow buttons (desktop) */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prev}
                className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors z-10"
                aria-label="Previous review"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors z-10"
                aria-label="Next review"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Review cards with fade transition */}
          <div className="relative min-h-[200px]">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: i === currentIndex ? 1 : 0, pointerEvents: i === currentIndex ? "auto" : "none" }}
              >
                <div className="rounded-xl border border-gray-200 bg-white p-8">
                  <div className="flex items-center justify-between mb-4">
                    <StarRating rating={review.rating} color={colorPalette.primary} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed mb-4 italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: colorPalette.primary }}
                    >
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {review.authorName}
                      </span>
                      {review.source === "google" && (
                        <span className="block text-xs text-gray-400">Google</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === currentIndex ? colorPalette.primary : "#d1d5db",
                    transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Google Reviews Link */}
        {googleBusinessProfileId && (
          <div className="text-center mt-8">
            <a
              href={`https://search.google.com/local/reviews?placeid=${googleBusinessProfileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline"
              style={{ color: colorPalette.primary }}
            >
              See all reviews on Google &rarr;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
