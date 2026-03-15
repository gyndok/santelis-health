export const metadata = {
  title: "Coming Soon | Santelis Health",
  description: "Create your medical practice website in under 30 minutes.",
};

export default function OnboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          We&apos;re putting the finishing touches on Santelis Health. Check back soon to create your practice website.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
