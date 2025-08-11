import { createFileRoute } from '@tanstack/react-router'
import { IconCircleChevronLeftFilled } from '@tabler/icons-react'
import { buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { MetricCard } from '@/components/admin/metric-card'
import { TextField } from '@/components/ui/text-field'
import { NumberField } from '@/components/ui/number-field'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

export const Route = createFileRoute('/admin/products/new')({
  loader: () => {
    return {
      title: 'New Product',
    }
  },
  component: RouteComponent,
})

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
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <MetricCard
          title="Basic Information"
          description="Enter the basic information for the product."
        >
          <div className="flex flex-col gap-6">
            <TextField label="Product Name" />
            <RichTextEditor label="Product Description" />
            {/* <TextField label="Product Description" /> */}
            <NumberField
              label="Product Price"
              defaultValue={1000}
              className="tabular-nums"
              formatOptions={{
                style: 'currency',
                currency: 'NGN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
                compactDisplay: 'short',
                currencyDisplay: 'narrowSymbol',
              }}
              step={500}
            />
          </div>
        </MetricCard>
      </div>
    </div>
  )
}
