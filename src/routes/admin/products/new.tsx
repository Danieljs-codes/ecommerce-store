import { createFileRoute } from '@tanstack/react-router'
import { IconCircleChevronLeftFilled } from '@tabler/icons-react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import type { ProductFormData } from '@/lib/schema'
import { Button, buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { productFormSchema } from '@/lib/schema'
import { ProductBasicsStep } from '@/components/admin/product-basics-step'
import ProductVariantsPublishStep from '@/components/admin/product-variants-publish-step'

export const Route = createFileRoute('/admin/products/new')({
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

function RouteComponent() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      tags: [],
      images: [],
      status: 'draft' as const,
      stockCount: 0,
      categoryId: '',
      metaTitle: '',
      metaDescription: '',
    },
    mode: 'onChange',
  })

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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProductBasicsStep />
            <ProductVariantsPublishStep />
          </div>

          <div className="flex items-center justify-end pt-6 border-t gap-2">
            <Button
              type="button"
              intent="secondary"
              onPress={() => {
                const formData = form.getValues()
                console.log('Saving draft:', formData)
              }}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              onPress={async () => {
                const isValid = await form.trigger()
                if (!isValid) return
                const formData = form.getValues()
                console.log('Submitting:', formData)
              }}
            >
              Create Product
            </Button>
          </div>
        </div>
      </FormProvider>
    </div>
  )
}
