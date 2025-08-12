import { createFileRoute } from '@tanstack/react-router'
import { IconCircleChevronLeftFilled } from '@tabler/icons-react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import type { ProductFormData } from '@/lib/schema'
import { Button, buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { productFormSchema } from '@/lib/schema'
import { ProductBasicsStep } from '@/components/admin/product-basics-step'
import ProductVariantsPublishStep from '@/components/admin/product-variants-publish-step'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Id } from '@convex/_generated/dataModel'
import { Loader } from '@/components/ui/loader'
import { useState } from 'react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = Route.useNavigate()
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

  const { mutateAsync: generateUploadUrl, isPending: isUploading } =
    useMutation({
      mutationFn: useConvexMutation(api.upload.generateUploadUrl),
    })
  const { mutateAsync: createProduct, isPending: isCreatingProduct } =
    useMutation({
      mutationFn: useConvexMutation(api.products.createProduct),
      onSuccess: () => {
        toast.success('Product created successfully!')
        navigate({
          to: '/admin/products',
        })
      },
      onError: (error) => toast.error(error.message),
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
              isPending={isSubmitting}
              onPress={async () => {
                const isValid = await form.trigger()
                if (!isValid) {
                  /* toast + return */
                }

                setIsSubmitting(true)
                try {
                  const values = form.getValues()

                  // Upload images sequentially (avoids flicker and rate spikes)
                  const storageIds: string[] = []
                  for (const file of values.images) {
                    const postUrl = await generateUploadUrl({})
                    const res = await fetch(postUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': file.type },
                      body: file,
                    })
                    const json = (await res.json()) as { storageId: string }
                    storageIds.push(json.storageId)
                  }

                  const priceKobo = Math.round(Number(values.price) * 100)

                  await createProduct({
                    name: values.name,
                    price: priceKobo,
                    description: values.description,
                    categoryId:
                      (values.categoryId as Id<'categories'>) || undefined,
                    tags: values.tags || [],
                    images: storageIds as Array<Id<'_storage'>>,
                    stockCount: Number(values.stockCount) || 0,
                    status: values.status,
                    publishAtMs: values.publishAt,
                    metaTitle: values.metaTitle || undefined,
                    metaDescription: values.metaDescription || undefined,
                  })
                } finally {
                  setIsSubmitting(false)
                }
              }}
            >
              {isSubmitting && <Loader />}
              {isSubmitting ? 'Creating product...' : 'Create product'}
            </Button>
          </div>
        </div>
      </FormProvider>
    </div>
  )
}
