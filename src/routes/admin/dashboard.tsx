import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import z from 'zod/v4'
import { parseAbsoluteToLocal } from '@internationalized/date'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { formatMoney } from '@/lib/utils'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Description, Label } from '@/components/ui/field'
import { MetricCard } from '@/components/admin/metric-card'

export const Route = createFileRoute('/admin/dashboard')({
  validateSearch: z.object({
    from: z.iso
      .datetime({ message: 'Must be a valid ISO date string' })
      .default(
        new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      )
      .catch(
        new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      ),
    to: z.iso
      .datetime({ message: 'Must be a valid ISO date string' })
      .default(new Date().toISOString())
      .catch(new Date().toISOString()),
  }),
  loaderDeps: ({ search: { from, to } }) => ({ from, to }),
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(
      convexQuery(api.overview.getOverviewData, {}),
    )
    context.queryClient.ensureQueryData(
      convexQuery(api.overview.getRecentSalesData, {
        from: new Date(deps.from).getTime(),
        to: new Date(deps.to).getTime(),
      }),
    )
    return {
      title: 'Overview',
    }
  },
  component: RouteComponent,
})

const fmtDelta = (change?: {
  pct: number | null
  delta: number
  direction: 'up' | 'down' | 'flat'
}) => {
  if (!change) return '—'
  const { pct, direction } = change
  if (pct == null) return 'No prior period'
  if (direction === 'flat') return 'No change from last month'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}% from last month`
}

function RouteComponent() {
  const search = Route.useSearch()
  // This would not delay each other since we kicked off fetching in the loader
  const { data } = useSuspenseQuery(
    convexQuery(api.overview.getOverviewData, {}),
  )
  const { data: salesData } = useSuspenseQuery(
    convexQuery(api.overview.getRecentSalesData, {
      from: new Date(search.from).getTime(),
      to: new Date(search.to).getTime(),
    }),
  )
  const navigate = Route.useNavigate()

  return (
    <div>
      <Heading className="sm:text-xl mb-6">
        Metrics over the last 30 Days
      </Heading>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <MetricCard
            title="Total Revenue"
            description="Total revenue from all sales in the last 30 days."
          >
            <div className="text-2xl font-semibold">
              {formatMoney(data.revenue30d)}
            </div>
            <div className="text-sm text-muted-fg mt-1">
              {fmtDelta(data.revenueChange)}
            </div>
          </MetricCard>

          <MetricCard
            title="Total Products"
            description="Total number of products in the store."
          >
            <div className="text-2xl font-semibold">
              {data.productsCountTotal}
            </div>
            <div className="text-sm text-muted-fg mt-1">
              +{data.productsAdded30d} in last 30 days
            </div>
          </MetricCard>

          <MetricCard
            title="Total Orders"
            description="Total number of orders in the last 30 days."
          >
            <div className="text-2xl font-semibold">
              {data.ordersCount30d.toLocaleString()}
            </div>
            <div className="text-sm text-muted-fg mt-1">
              {fmtDelta(data.ordersChange)}
            </div>
          </MetricCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Top Selling Products"
            description="The top selling products in your store."
          >
            <div className="flex flex-col gap-y-4">
              <div className="grid grid-cols-[auto_1fr_auto] items-center">
                <Label className="text-muted-fg">Unique Visitors</Label>
                <span className="mx-2 after:block after:h-[1.5px] after:grow after:bg-[repeating-linear-gradient(to_right,theme(--color-muted-fg/50%)_0,theme(--color-muted-fg/50%)_1.5px,_transparent_1.5px,_transparent_6px)] after:bg-repeat-x after:content-['']"></span>
                <Description>
                  <span>13,472</span>
                </Description>
              </div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center">
                <Label className="text-muted-fg">Unique Visitors</Label>
                <span className="mx-2 after:block after:h-[1.5px] after:grow after:bg-[repeating-linear-gradient(to_right,theme(--color-muted-fg/50%)_0,theme(--color-muted-fg/50%)_1.5px,_transparent_1.5px,_transparent_6px)] after:bg-repeat-x after:content-['']"></span>
                <Description>
                  <span>13,472</span>
                </Description>
              </div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center">
                <Label className="text-muted-fg">Unique Visitors</Label>
                <span className="mx-2 after:block after:h-[1.5px] after:grow after:bg-[repeating-linear-gradient(to_right,theme(--color-muted-fg/50%)_0,theme(--color-muted-fg/50%)_1.5px,_transparent_1.5px,_transparent_6px)] after:bg-repeat-x after:content-['']"></span>
                <Description>
                  <span>13,472</span>
                </Description>
              </div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center">
                <Label className="text-muted-fg">Unique Visitors</Label>
                <span className="mx-2 after:block after:h-[1.5px] after:grow after:bg-[repeating-linear-gradient(to_right,theme(--color-muted-fg/50%)_0,theme(--color-muted-fg/50%)_1.5px,_transparent_1.5px,_transparent_6px)] after:bg-repeat-x after:content-['']"></span>
                <Description>
                  <span>13,472</span>
                </Description>
              </div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center">
                <Label className="text-muted-fg">Unique Visitors</Label>
                <span className="mx-2 after:block after:h-[1.5px] after:grow after:bg-[repeating-linear-gradient(to_right,theme(--color-muted-fg/50%)_0,theme(--color-muted-fg/50%)_1.5px,_transparent_1.5px,_transparent_6px)] after:bg-repeat-x after:content-['']"></span>
                <Description>
                  <span>13,472</span>
                </Description>
              </div>
            </div>
          </MetricCard>

          <MetricCard
            title="Recent Sales"
            description="Your store's sales revenue for the last 30 days."
            classNames={{
              content: 'lg:col-span-2',
            }}
            action={
              <DateRangePicker
                visibleDuration={{ months: 2 }}
                aria-label="Sales date range"
                className="font-mono"
                granularity="day"
                value={{
                  start: parseAbsoluteToLocal(search.from),
                  end: parseAbsoluteToLocal(search.to),
                }}
                onChange={(val) => {
                  if (!val) return
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      from: val.start.toAbsoluteString(),
                      to: val.end.toAbsoluteString(),
                    }),
                  })
                }}
              />
            }
          >
            <div className="text-2xl font-semibold">
              {data.ordersCount30d.toLocaleString()}
            </div>
            <div className="text-sm text-muted-fg mt-1">
              {fmtDelta(data.ordersChange)}
            </div>
          </MetricCard>
        </div>
      </div>
    </div>
  )
}
