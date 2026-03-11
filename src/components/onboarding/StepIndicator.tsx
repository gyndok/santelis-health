"use client";

const STEP_LABELS = [
  "Practice Basics",
  "Services",
  "Provider Details",
  "Location & Hours",
  "Branding",
  "Review & Generate",
];

interface StepIndicatorProps {
  currentStep: number; // 1-based
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 6 }: StepIndicatorProps) {
  return (
    <div className="w-full mb-10">
      {/* Desktop step indicator */}
      <div className="hidden sm:flex items-center justify-between">
        {STEP_LABELS.slice(0, totalSteps).map((label, idx) => {
          const step = idx + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isCompleted
                      ? "bg-teal-600 text-white"
                      : isActive
                      ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 whitespace-nowrap ${
                    isActive ? "text-teal-700 font-semibold" : isCompleted ? "text-teal-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${
                    isCompleted ? "bg-teal-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step indicator */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-teal-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{STEP_LABELS[currentStep - 1]}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
