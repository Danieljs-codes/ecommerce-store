import { ProductStepper } from '@/routes/admin/products/new'

export function StepperHeader() {
  const { current } = ProductStepper.useStepper()
  const allSteps = ProductStepper.utils.getAll()
  const currentIndex = allSteps.findIndex((step) => step.id === current.id)

  return (
    <div className="mb-8">
      {/* Mobile progress bar - only visible on small screens */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-fg">
            Step {currentIndex + 1} of {allSteps.length}
          </span>
          <span className="text-sm text-muted-fg">
            {Math.round(((currentIndex + 1) / allSteps.length) * 100)}%
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / allSteps.length) * 100}%`,
            }}
          />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">{current.title}</h2>
          <p className="text-sm text-muted-fg">{current.description}</p>
        </div>
      </div>

      {/* Desktop stepper - hidden on small screens */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {allSteps.map((step, index) => {
            const isActive = current.id === step.id
            const isCompleted = index < currentIndex

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
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
                      index + 1
                    )}
                  </div>

                  {/* Step labels - hide on medium screens, show on large */}
                  <div className="ml-3 min-w-0 hidden lg:block">
                    <p
                      className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-fg'}`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-fg">{step.description}</p>
                  </div>
                </div>

                {/* Connector line */}
                {index < allSteps.length - 1 && (
                  <div className="flex-1 mx-3 lg:mx-4">
                    <div
                      className={`h-px transition-colors ${
                        index < currentIndex ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Current step info for medium screens (when labels are hidden) */}
        <div className="lg:hidden mt-4 text-center">
          <h2 className="text-lg font-semibold">{current.title}</h2>
          <p className="text-sm text-muted-fg">{current.description}</p>
        </div>
      </div>
    </div>
  )
}
