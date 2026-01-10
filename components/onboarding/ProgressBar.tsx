interface ProgressBarProps {
  currentStep: number;
  stepName: string;
  totalSteps?: number;
}

export default function ProgressBar({ currentStep, stepName, totalSteps = 2 }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-6 justify-between items-end">
        <p className="text-[#0d181c] text-lg font-bold leading-normal">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-[#49879c] text-sm font-medium leading-normal hidden sm:block">
          {stepName}
        </p>
      </div>
      {/* Visual Steps */}
      <div className="flex gap-2">
        <div className={`h-2 rounded-full flex-1 ${currentStep >= 1 ? "bg-primary" : "bg-[#cee2e8]"}`}></div>
        <div className={`h-2 rounded-full flex-1 ${currentStep >= 2 ? "bg-primary" : "bg-[#cee2e8]"}`}></div>
      </div>
    </div>
  );
}
