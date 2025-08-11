import { Controller, useFormContext } from 'react-hook-form'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import { NumberField } from '../ui/number-field'
import { TextField } from '../ui/text-field'
import { Select } from '../ui/select'
import { MetricCard } from './metric-card'
import { RichTextEditor } from './rich-text-editor'
import type { ProductFormData } from '@/lib/schema'
import { useSuspenseQueryDeferred } from '@/hooks/use-suspense-query-deferred'

const formatOptions = {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  compactDisplay: 'short',
  currencyDisplay: 'narrowSymbol',
} satisfies Intl.NumberFormatOptions

export const ProductBasicsStep = () => {
  const { data: categories } = useSuspenseQueryDeferred(
    convexQuery(api.categories.getExistingCategories, {}),
  )

  console.log(categories)

  const { control } = useFormContext<ProductFormData>()
  return (
    <>
      <MetricCard
        title="Basic Information"
        description="Enter the basic information for the product."
      >
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <TextField
                label="Product Name"
                {...field}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="basePrice"
            render={({ field, fieldState }) => (
              <NumberField
                label="Base Price"
                formatOptions={formatOptions}
                {...field}
                onChange={(value) =>
                  field.onChange(Number.isNaN(value) ? 0 : value)
                }
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <RichTextEditor
                label="Description"
                {...field}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="categoryId"
            render={({ field, fieldState }) => (
              <Select
                label="Category"
                description="Choose a category for your product"
                placeholder="Select category"
                {...field}
                selectedKey={field.value}
                onSelectionChange={field.onChange}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                <Select.Trigger />
                <Select.List items={categories}>
                  {(item) => (
                    <Select.Option id={item.id} textValue={item.name}>
                      <Select.Label className="capitalize">
                        {item.name.toLowerCase()}
                      </Select.Label>
                    </Select.Option>
                  )}
                </Select.List>
              </Select>
            )}
          />
        </div>
      </MetricCard>
      <MetricCard title="Product Images"></MetricCard>
    </>
  )
}
