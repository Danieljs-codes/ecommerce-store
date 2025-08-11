import { Controller, useFormContext } from 'react-hook-form'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import { Button, FileTrigger, isFileDropItem } from 'react-aria-components'
import { IconCircleXFill } from '@intentui/icons'
import { toast } from 'sonner'
import { NumberField } from '../ui/number-field'
import { TextField } from '../ui/text-field'
import { Select } from '../ui/select'
import { DropZone } from '../ui/drop-zone'
import { IconImageUpload } from '../icons/image-upload'
import { Button as UIButton } from '../ui/button'
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

  const { control, watch, setValue } = useFormContext<ProductFormData>()

  const uploadedImages = watch('images')

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
      <div>
        <MetricCard
          title="Product Images"
          description="Upload images for your product. You can add multiple images."
        >
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <DropZone
                getDropOperation={(types) =>
                  types.has('image/jpeg') ||
                  types.has('image/png') ||
                  types.has('image/webp')
                    ? 'copy'
                    : 'cancel'
                }
                className="group/drop-zone relative z-10 flex max-h-56 items-center justify-center overflow-hidden rounded-lg p-6"
                onDrop={async (e) => {
                  const item = e.items
                    .filter(isFileDropItem)
                    .find(
                      (dropItem) =>
                        dropItem.type === 'image/jpeg' ||
                        dropItem.type === 'image/png' ||
                        dropItem.type === 'image/webp',
                    )
                  if (!item) return
                  const file = await item.getFile()

                  const existingFiles = field.value
                  const isDuplicate = existingFiles.some(
                    (existing) => existing.name === file.name,
                  )

                  if (isDuplicate) {
                    toast.error(`File "${file.name}" is already uploaded`)
                    return
                  }

                  field.onChange([...field.value, file])
                }}
              >
                <div className="grid space-y-3 py-6">
                  <IconImageUpload className="mx-auto size-8 text-muted-fg" />
                  <div className="flex items-center gap-x-2 text-center text-sm/6">
                    <div className="leading-normal">
                      Drag and drop to upload or <br />
                      <FileTrigger
                        acceptedFileTypes={[
                          'image/png',
                          'image/jpeg',
                          'image/webp',
                        ]}
                        allowsMultiple={true}
                        onSelect={(files) => {
                          if (!files) return
                          const validFiles = Array.from(files)
                          if (validFiles.length === 0) return

                          const existingFiles = field.value
                          const newFiles: Array<File> = []
                          const duplicateFiles: Array<string> = []

                          validFiles.forEach((file) => {
                            const isDuplicate = existingFiles.some(
                              (existing) => existing.name === file.name,
                            )

                            if (isDuplicate) {
                              duplicateFiles.push(file.name)
                            } else {
                              newFiles.push(file)
                            }
                          })

                          if (duplicateFiles.length > 0) {
                            if (duplicateFiles.length === 1) {
                              toast.error(
                                `File "${duplicateFiles[0]}" is already uploaded`,
                              )
                            } else {
                              toast.error(
                                `${duplicateFiles.length} files are already uploaded`,
                              )
                            }
                          }

                          if (newFiles.length > 0) {
                            field.onChange([...field.value, ...newFiles])
                          }
                        }}
                      >
                        <Button className="text-primary underline">
                          Choose images
                        </Button>{' '}
                      </FileTrigger>
                      to upload
                    </div>
                  </div>
                </div>
              </DropZone>
            )}
          />
          <p className="text-muted-fg text-sm/5.5 group-disabled:opacity-50 mt-2 block sm:text-xs">
            Supports PNG, JPG, and WEBP formats. Maximum 2MB per image.
          </p>
        </MetricCard>
        {uploadedImages.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {uploadedImages.map((img) => {
              const imageUrl = URL.createObjectURL(img)
              return (
                <MetricCard
                  classNames={{
                    card: 'size-32 md:size-40 flex',
                    content: 'p-0 overflow-hidden flex-1 flex isolate relative',
                  }}
                  key={img.name}
                >
                  <img
                    src={imageUrl}
                    alt={img.name}
                    className="w-full h-full object-cover flex-shrink-0"
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                  />
                  <UIButton
                    size="sq-xs"
                    intent="danger"
                    className="absolute top-1 right-1 z-10 rounded-full"
                    onPress={() => {
                      setValue(
                        'images',
                        uploadedImages.filter((file) => file.name !== img.name),
                      )
                      URL.revokeObjectURL(imageUrl)
                    }}
                  >
                    <IconCircleXFill />
                  </UIButton>
                </MetricCard>
              )
            })}
          </div>
        ) : null}
      </div>
    </>
  )
}
