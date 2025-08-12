// components/admin/stepper-navigation.tsx
import type { UseFormReturn } from 'react-hook-form'
import type { ProductFormData } from '@/lib/schema'
import { Button } from '@/components/ui/button'

interface StepperNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  form: UseFormReturn<ProductFormData>
}

export function StepperNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  form,
}: StepperNavigationProps) {
  const isFirst = currentStep === 1
  const isLast = currentStep === totalSteps

  // Define which fields belong to each step
  const getStepFields = (stepNumber: number): Array<keyof ProductFormData> => {
    switch (stepNumber) {
      case 1:
        // Step 1: Product Details (basics + images)
        return ['name', 'price', 'description', 'categoryId', 'tags', 'images']
      case 2:
        // Step 2: Inventory & Publishing
        return [
          'stockCount',
          'status',
          'metaTitle',
          'metaDescription',
          'publishAt',
        ]
      default:
        return []
    }
  }

  const validateCurrentStep = async () => {
    const fieldsToValidate = getStepFields(currentStep)

    // Use RHF's trigger method to validate only current step fields
    const isValid = await form.trigger(fieldsToValidate)
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()

    console.log('isValid', isValid)

    if (isValid) {
      if (isLast) {
        // Final validation before submit
        const finalValidation = await form.trigger()
        if (finalValidation) {
          handleSubmit()
        }
      } else {
        onNext()
      }
    }
  }

  const handleSubmit = async () => {
    const formData = form.getValues()
    console.log('Submitting:', formData)

    try {
      // Handle form submission here
      // await createProduct(formData)
    } catch (error) {
      console.error('Submission error:', error)
    }
  }

  const saveDraft = async () => {
    // Save draft without validation
    const formData = form.getValues()
    console.log('Saving draft:', formData)

    try {
      // await saveDraftProduct(formData)
    } catch (error) {
      console.error('Draft save error:', error)
    }
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        type="button"
        intent="outline"
        onPress={onPrev}
        isDisabled={isFirst}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        <Button type="button" intent="secondary" onPress={saveDraft}>
          Save Draft
        </Button>

        <Button type="button" onPress={handleNext}>
          {isLast ? 'Create Product' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
