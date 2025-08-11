import { createFileRoute } from '@tanstack/react-router'
import { IconCircleChevronLeftFilled } from '@tabler/icons-react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import type { ProductFormData } from '@/lib/schema'
import { buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { productFormSchema } from '@/lib/schema'
import { StepperHeader } from '@/components/admin/stepper-header'
import { ProductBasicsStep } from '@/components/admin/product-basics-step'
import { StepperNavigation } from '@/components/admin/stepper-navigation'

const searchParamSchema = z.object({
  step: z.union([z.literal(1), z.literal(2)]).default(1),
})

export const Route = createFileRoute('/admin/products/new')({
  validateSearch: searchParamSchema,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      convexQuery(api.categories.getExistingCategories, {}),
    )
    return {
      title: 'New Product',
    }
  },
  component: RouteComponent,
})

const steps: Array<{ id: 1 | 2; title: string; description: string }> = [
  {
    id: 1,
    title: 'Product Details',
    description: 'Basic information and images',
  },
  {
    id: 2,
    title: 'Variants & Publishing',
    description: 'Inventory, variants, and publish settings',
  },
]

function RouteComponent() {
  const navigate = Route.useNavigate()
  const currentStep = Route.useSearch({
    select: (s) => s.step,
  })
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      basePrice: 0,
      description: '',
      tags: [],
      images: [],
      hasVariants: false,
      status: 'draft' as const,
      stockCount: 0,
      categoryId: '',
    },
    mode: 'onChange',
  })

  const goToStep = (stepNumber: 1 | 2) => {
    navigate({
      search: (prev) => ({
        ...prev,
        step: stepNumber,
      }),
      replace: true,
    })
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          to=".."
          className={buttonStyles({ size: 'sm', intent: 'outline' })}
        >
          <IconCircleChevronLeftFilled data-slot="icon" />
          Back
        </Link>
      </div>
      <FormProvider {...form}>
        <div className="space-y-8">
          {/* Step Header */}
          <StepperHeader
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          {/* Step Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {currentStep === 1 && <ProductBasicsStep />}
            {/* {currentStep === 2 && <ProductVariantsPublishStep />} */}
          </div>

          {/* Navigation  */}
          <StepperNavigation
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={() => goToStep((currentStep + 1) as 1 | 2)}
            onPrev={() => goToStep((currentStep - 1) as 1 | 2)}
            form={form}
          />
        </div>
      </FormProvider>
    </div>
  )
}
