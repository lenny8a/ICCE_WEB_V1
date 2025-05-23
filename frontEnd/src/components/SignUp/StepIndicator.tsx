import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border 
                ${
                  currentStep === step
                    ? "border-warning bg-warning text-white"
                    : currentStep > step
                    ? "border-warning bg-warning/20 text-warning"
                    : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                }`}
            >
              {currentStep > step ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`w-8 h-0.5 ${currentStep > step ? "bg-warning" : "bg-gray-300 dark:bg-gray-600"}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
