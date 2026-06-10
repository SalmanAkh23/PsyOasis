import React from 'react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function ProgressStepper({ currentStep, totalSteps, stepNames }: ProgressStepperProps) {
  return (
    <div className="w-full mb-8 relative">
      {/* Background Track */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-[#709085]/15 -translate-y-1/2 rounded-full" />
      
      {/* Active Track */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#4A7A96] to-[#709085] -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out" 
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      />
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {stepNames.map((name, idx) => {
          const stepNumber = idx + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={name} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 z-10 
                ${isActive ? 'bg-[#4A7A96] text-white shadow-[0_0_15px_rgba(74,122,150,0.4)] scale-110' : 
                  isCompleted ? 'bg-[#709085] text-white' : 'bg-white text-[#2D3732]/40 border border-[#709085]/25'}`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div className={`text-[10px] uppercase font-space mt-2 tracking-wider transition-colors duration-300 absolute -bottom-6 w-24 text-center -ml-8
                ${isActive ? 'text-[#4A7A96] font-bold' : isCompleted ? 'text-[#709085]' : 'text-[#2D3732]/35'}`}
              >
                {/* Only show text on active/completed for cleaner UI on mobile, but on desktop we can show all */}
                <span className="hidden md:inline-block">{name}</span>
                <span className="md:hidden">{isActive ? name : ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
