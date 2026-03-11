import type { Review, ColorPalette, Integrations } from "@/types";

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

        {/* Review Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <StarRating rating={review.rating} color={colorPalette.primary} />
                <span className="text-xs text-gray-400">
                  {new Date(review.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: colorPalette.primary }}
                >
                  {review.authorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {review.authorName}
                </span>
                {review.source === "google" && (
                  <span className="text-xs text-gray-400 ml-auto">Google</span>
                )}
              </div>
            </div>
          ))}
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
