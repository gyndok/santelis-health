import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Get Started | Santelis Health",
  description: "Create your medical practice website in under 30 minutes.",
};

export default function OnboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Let&apos;s build your website
        </h1>
        <p className="text-gray-600 mb-10">
          Tell us about your practice and we&apos;ll generate a preview in minutes.
        </p>

        {/* Step 1: Practice Basics — placeholder form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Practice Basics</h2>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="practiceName" className="block text-sm font-medium text-gray-700 mb-1">
                Practice Name
              </label>
              <input
                id="practiceName"
                type="text"
                placeholder="e.g., Klein's Women's Care"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Specialty
              </label>
              <select
                id="specialty"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
              >
                <option value="">Select a specialty...</option>
                <option value="obgyn">Obstetrics & Gynecology</option>
                <option value="family-medicine">Family Medicine</option>
                <option value="dermatology">Dermatology</option>
                <option value="orthopedics">Orthopedic Surgery</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="internal-medicine">Internal Medicine</option>
                <option value="med-spa">Medical Spa</option>
                <option value="cardiology">Cardiology</option>
                <option value="urology">Urology</option>
                <option value="ent">ENT (Otolaryngology)</option>
              </select>
            </div>

            <div>
              <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Provider Name
              </label>
              <input
                id="providerName"
                type="text"
                placeholder="e.g., Dr. Geffrey Klein"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="credentials" className="block text-sm font-medium text-gray-700 mb-1">
                Credentials
              </label>
              <input
                id="credentials"
                type="text"
                placeholder="e.g., MD, FACOG"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Webster"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  placeholder="TX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Office Phone
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="(281) 557-0300"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="office@yourpractice.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <button
              type="button"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Continue to Services →
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Steps 2-6 (Services, Provider Details, Integrations, Branding, Content) coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}
