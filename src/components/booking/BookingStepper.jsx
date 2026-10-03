import React from 'react';
import { Check, Scissors, MapPin, Store, Calendar, CreditCard } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Salon & City', subtitle: 'Choose Lounge', icon: Store },
  { id: 2, title: 'Treatments', subtitle: 'Choose Services', icon: Scissors },
  { id: 3, title: 'Schedule', subtitle: 'Date & Stylist', icon: Calendar },
  { id: 4, title: 'Review', subtitle: 'Wallet Advance', icon: CreditCard },
];

const BookingStepper = ({ currentStep = 1, onStepClick, maxStepReached = 1 }) => {
  return (
    <div className="w-full bg-white border-b border-gray-150 py-3 sm:py-4 px-4 shadow-2xs font-outfit">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Desktop / Tablet Stepper (Horizontal) */}
        <div className="hidden md:flex items-center justify-between gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isAccessible = step.id <= maxStepReached;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => isAccessible && onStepClick && onStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-3 py-2 px-3.5 rounded-2xl transition-all duration-200 text-left ${
                    isAccessible ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-45'
                  }`}
                >
                  {/* Step Bubble */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                        : isCurrent
                        ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check size={16} className="stroke-[3]" /> : <Icon size={16} />}
                  </div>

                  {/* Step Titles */}
                  <div className="min-w-0">
                    <p
                      className={`text-sm sm:text-base font-bold leading-tight ${
                        isCurrent
                          ? 'text-primary'
                          : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs font-medium truncate mt-0.5 ${
                        isCurrent
                          ? 'text-primary/80 font-semibold'
                          : isCompleted
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </button>

                {/* Connector line between steps */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] rounded-full mx-1 transition-colors duration-300 ${
                      step.id < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Stepper Header (< 768px) */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {STEPS[currentStep - 1]?.title} • {STEPS[currentStep - 1]?.subtitle}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingStepper;
