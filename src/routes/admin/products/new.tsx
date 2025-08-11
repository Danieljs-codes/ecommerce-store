import { createFileRoute } from '@tanstack/react-router'
import { IconCircleChevronLeftFilled } from '@tabler/icons-react'
import { defineStepper } from '@stepperize/react'
import { buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { ProductBasicsStep } from '@/components/admin/product-basics-step'
import { StepperHeader } from '@/components/admin/stepper-header'

// steppers/product-stepper.tsx

export const Route = createFileRoute('/admin/products/new')({
  loader: () => {
    return {
      title: 'New Product',
    }
  },
  component: RouteComponent,
})

export const ProductStepper = defineStepper(
  {
    id: 'basics',
    title: 'Basic Information',
    description: 'Product name, description, and pricing',
  },
  {
    id: 'images',
    title: 'Product Images',
    description: 'Upload product photos',
  },
  {
    id: 'variants',
    title: 'Variants & Inventory',
    description: 'Configure product variants and stock',
  },
  {
    id: 'publish',
    title: 'SEO & Publishing',
    description: 'Publish settings and SEO optimization',
  },
)

function RouteComponent() {
  return (
    <div>
      <div>
        <Link
          to=".."
          className={buttonStyles({ size: 'sm', intent: 'outline' })}
        >
          <IconCircleChevronLeftFilled data-slot="icon" />
          Back
        </Link>
      </div>
      <div className="mt-8">
        <StepperHeader />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProductStepper.Scoped>
            <ProductBasicsStep />
          </ProductStepper.Scoped>
        </div>
      </div>
    </div>
  )
}
