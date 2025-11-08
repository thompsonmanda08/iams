import { Fragment } from "react";

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  mode: "create" | "edit";
  onStepClick: (step: number) => void;
}

export function StepProgressIndicator({
  currentStep,
  totalSteps = 3,
  mode,
  onStepClick
}: StepProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex w-full items-center justify-between">
      {steps.map((step) => (
        <Fragment key={step}>
          <button
            type="button"
            onClick={() => {
              if (mode === "edit" || step < currentStep) {
                onStepClick(step);
              }
            }}
            disabled={mode === "create" && step > currentStep}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              step <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            } font-semibold transition-colors ${
              mode === "edit" || step < currentStep
                ? "cursor-pointer hover:opacity-80"
                : "cursor-not-allowed"
            }`}>
            {step}
          </button>
          {step < totalSteps && (
            <div className={`mx-2 h-1 flex-1 ${step < currentStep ? "bg-primary" : "bg-muted"}`} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
