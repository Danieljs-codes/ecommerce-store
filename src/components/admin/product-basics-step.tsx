import { NumberField } from '../ui/number-field'
import { TextField } from '../ui/text-field'
import { MetricCard } from './metric-card'
import { RichTextEditor } from './rich-text-editor'

export const ProductBasicsStep = () => {
  return (
    <div>
      <MetricCard
        title="Basic Information"
        description="Enter the basic information for the product."
      >
        <div className="flex flex-col gap-6">
          <TextField
            label="Product Name"
            description="This will be displayed to customers"
          />
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
          <RichTextEditor label="Product Description" />
        </div>
      </MetricCard>
    </div>
  )
}
