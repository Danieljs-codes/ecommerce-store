import { createFileRoute } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import z from 'zod/v4'
import { parseAbsoluteToLocal } from '@internationalized/date'
import { Suspense, useEffect } from 'react'
import { Heading } from '@/components/ui/heading'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Description, Label } from '@/components/ui/field'
import { MetricCard } from '@/components/admin/metric-card'
import { OverviewMetrics } from '@/components/admin/overview-metrics'
import { useSuspenseQueryDeferred } from '@/hooks/use-suspense-query-deferred'
import { Loader } from '@/components/ui/loader'
import { LineChart } from '@/components/ui/line-chart'
import { formatMoney } from '@/lib/utils'

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

const dailyEarnings: Array<{
  day: number
  earnings: number
}> = [
  { day: 1703548800000, earnings: 1250000 }, // Dec 26, 2023
  { day: 1703635200000, earnings: 1875000 }, // Dec 27, 2023
  { day: 1703721600000, earnings: 930000 }, // Dec 28, 2023
  { day: 1703808000000, earnings: 2560000 }, // Dec 29, 2023
  { day: 1703894400000, earnings: 1420000 }, // Dec 30, 2023
  { day: 1703980800000, earnings: 3150000 }, // Dec 31, 2023
  { day: 1704067200000, earnings: 2280000 }, // Jan 1, 2024
]

function RouteComponent() {
  const search = Route.useSearch()
  const { data: salesData, isSuspending } = useSuspenseQueryDeferred(
    convexQuery(api.overview.getRecentSalesData, {
      from: new Date(search.from).getTime(),
      to: new Date(search.to).getTime(),
    }),
  )
  const navigate = Route.useNavigate()

  useEffect(() => {
    console.log(salesData)
  }, [salesData])

  return (
    <div>
      <Heading className="sm:text-xl mb-6">
        Metrics over the last 30 Days
      </Heading>
      <div className="flex flex-col gap-4">
        <Suspense
          fallback={
            // TODO: Implement the proper fallback
            <div className="flex justify-center">
              <Loader intent="primary" />
            </div>
          }
        >
          <OverviewMetrics />
        </Suspense>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Top Selling Products"
            description="The top selling products in your store."
            classNames={{
              content: 'h-full',
            }}
          >
            <div className="flex flex-col gap-y-4">
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
              content: 'lg:col-span-2 h-full p-0',
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
            <div className="px-1 pt-4">
              <LineChart
                className="h-56 min-h-[224px] sm:h-72 sm:min-h-[288px]"
                data={dailyEarnings.map((earnings) => {
                  return {
                    day: new Date(earnings.day).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                    }),
                    earnings: earnings.earnings,
                  }
                })}
                dataKey="day"
                xAxisProps={{
                  interval: 'preserveStartEnd',
                }}
                yAxisProps={{
                  width: 80,
                  tickFormatter: (value) => {
                    const nairaValue = value / 100
                    if (nairaValue >= 1000000) {
                      return `${(nairaValue / 1000000).toFixed(1)}M`
                    }
                    if (nairaValue >= 1000) {
                      return `${(nairaValue / 1000).toFixed(1)}K`
                    }
                    return `${nairaValue.toLocaleString()}`
                  },
                }}
                config={{
                  earnings: { label: 'Earnings' },
                }}
                tooltipProps={{
                  formatter: (value, label) => (
                    <span className="flex w-full flex-wrap gap-2 *:data-[slot=icon]:size-2.5 *:data-[slot=icon]:text-muted-fg items-center">
                      <div
                        className="shrink-0 rounded-full border-(--color-border) bg-(--color-bg) size-2.5"
                        style={
                          {
                            '--color-bg': 'var(--chart-1)',
                            '--color-border': 'var(--chart-1)',
                          } as React.CSSProperties
                        }
                      />
                      <div className="flex flex-1 justify-between leading-none items-center">
                        <span className="flex-1 capitalize font-sans">
                          {label}
                        </span>
                        <span> {formatMoney(value as number)}</span>
                      </div>
                    </span>
                  ),
                }}
              />
            </div>
          </MetricCard>
        </div>
      </div>
    </div>
  )
}
