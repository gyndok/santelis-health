"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default function OnboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleGoogleLogin() {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/prospects`,
      },
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Authenticated users see the full onboarding wizard
  if (user) {
    return <OnboardingWizard />;
  }

  // Everyone else sees Coming Soon with admin login option
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          We&apos;re putting the finishing touches on Santelis Health. Check back
          soon to create your practice website.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </a>
          <button
            onClick={handleGoogleLogin}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Team login &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
