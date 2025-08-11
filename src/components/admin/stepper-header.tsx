export function StepperHeader({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: Array<{ id: 1 | 2; title: string; description: string }>
  currentStep: number
  onStepClick: (step: 1 | 2) => void
}) {
  return (
    <div className="mb-8">
      {/* Mobile progress bar */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-fg">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-fg">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop stepper */}
      <div className="hidden sm:block">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            const isClickable = currentStep >= step.id

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className="flex items-center disabled:cursor-not-allowed"
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-primary text-primary-fg ring-4 ring-primary/20'
                          : isCompleted
                            ? 'bg-primary text-primary-fg'
                            : 'bg-muted text-muted-fg'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>

                  <div className="ml-3 text-left">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? 'text-fg' : 'text-muted-fg'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-fg">{step.description}</p>
                  </div>
                </button>

                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`h-px transition-colors ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
