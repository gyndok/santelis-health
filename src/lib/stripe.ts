import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
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
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
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
    priceId: process.env.STRIPE_PRACTICE_PRICE_ID!,
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
