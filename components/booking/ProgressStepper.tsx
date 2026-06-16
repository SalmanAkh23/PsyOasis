import React from 'react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function ProgressStepper({ currentStep, totalSteps, stepNames }: ProgressStepperProps) {
  return (
    <div className="w-full mb-10 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#D9E2DC] -translate-y-1/2 rounded-full" />

      <div
        className="absolute top-1/2 left-0 h-0.5 bg-[#315ab4] -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      />

      <div className="relative flex justify-between">
        {stepNames.map((name, idx) => {
          const stepNumber = idx + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={name} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 z-10 
                ${isActive
                  ? 'bg-[#315ab4] text-white shadow-[0_0_10px_rgba(74,122,150,0.35)]'
                  : isCompleted
                    ? 'bg-[#315ab4] text-white'
                    : 'bg-white text-[#1a1c1e]/40 border-2 border-[#D9E2DC]'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <div className={`text-[10px] uppercase font-space mt-2.5 tracking-wider text-center
                ${isActive ? 'text-[#315ab4] font-bold' : isCompleted ? 'text-[#315ab4]/70' : 'text-[#1a1c1e]/35'}`}
              >
                <span className="hidden md:inline">{name}</span>
                <span className="md:hidden">{isActive ? name : ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
