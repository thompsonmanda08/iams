import { CheckCircle2 } from "lucide-react";

function ProgressStepperV1({
  currentStep,
  steps = []
}: {
  currentStep: number;
  steps: { id: number; name: string; Icon: any }[];
}) {
  return (
    <div className="mb-4">
      <div className="relative flex items-start justify-between">
        {steps &&
          steps.map((step, index) => {
            const Icon = step.Icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="relative z-10 flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : ""} ${isCompleted ? "border-primary bg-primary text-primary-foreground" : ""} ${!isActive && !isCompleted ? "border-muted bg-background text-muted-foreground" : ""} `}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium text-nowrap ${isActive ? "text-foreground" : "text-muted-foreground"} `}>
                  {step.name}
                </span>
                {index < 2 && (
                  <div
                    className={`absolute top-5 left-[calc(50%+1.25rem)] -z-10 h-0.5 w-[calc(100%-1.25rem)] transition-colors ${isCompleted ? "bg-primary" : "bg-muted"} `}
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default ProgressStepperV1;
