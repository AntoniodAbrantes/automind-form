import { Check, ChevronRight } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: number; label: string }[];
}

export default function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6 sm:mb-8" data-testid="progress-bar-container">
      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-center space-x-4 mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                  step.id < currentStep
                    ? "bg-green-600"
                    : step.id === currentStep
                    ? "bg-primary"
                    : "bg-dark-tertiary text-gray-400"
                }`}
                data-testid={`step-indicator-${step.id}`}
              >
                {step.id < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span 
                className={`text-sm font-medium ${
                  step.id <= currentStep ? "text-gray-300" : "text-gray-400"
                }`}
                data-testid={`step-label-${step.id}`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-0.5 bg-dark-tertiary mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden items-center justify-between mb-4 px-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center space-y-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-300 ${
                step.id < currentStep
                  ? "bg-green-600"
                  : step.id === currentStep
                  ? "bg-primary"
                  : "bg-dark-tertiary text-gray-400"
              }`}
              data-testid={`step-indicator-mobile-${step.id}`}
            >
              {step.id < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <span 
              className={`text-xs font-medium text-center ${
                step.id <= currentStep ? "text-gray-300" : "text-gray-400"
              }`}
              data-testid={`step-label-mobile-${step.id}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full bg-dark-tertiary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
}
