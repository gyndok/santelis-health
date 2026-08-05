import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazily initialized Stripe client (mirrors supabase-admin.ts) so that
 * importing this module never crashes a build/boot when the key is unset.
 * Server-side only.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    amount: 2900, // $29/mo
    features: [
      "1 provider",
      "All core pages",
      "SEO engine",
      "Custom domain",
      "Basic analytics",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    amount: 5900, // $59/mo
    features: [
      "Up to 3 providers",
      "Blog & video gallery",
      "Consent form links",
      "Google Search Console",
      "Monthly SEO report",
      "Priority support",
    ],
  },
  practice: {
    name: "Practice",
    priceId: process.env.STRIPE_PRACTICE_PRICE_ID ?? "",
    amount: 9900, // $99/mo
    features: [
      "Up to 10 providers",
      "Built-in form builder",
      "Advanced analytics",
      "Multiple locations",
      "2-way patient texting",
      "Phone support",
    ],
  },
} as const;
