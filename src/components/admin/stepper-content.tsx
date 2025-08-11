import { FormProvider } from 'react-hook-form'
import { ProductBasicsStep } from './product-basics-step'
import type { UseFormReturn } from 'react-hook-form'
import type { ProductFormData } from '@/lib/schema'
import { ProductStepper } from '@/routes/admin/products/new'

interface StepperContentProps {
  form: UseFormReturn<ProductFormData>
}

export const StepperContent = ({ form }: StepperContentProps) => {
  const stepper = ProductStepper.useStepper()
  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 gap-6">
        {stepper.switch({
          basics: () => <ProductBasicsStep />,
          images: () => <div>Product Images Step</div>,
        })}
      </div>
    </FormProvider>
  )
}
