import { createFileRoute } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import z from 'zod/v4'
import { Suspense } from 'react'
import { Heading } from '@/components/ui/heading'
import { OverviewMetrics } from '@/components/admin/overview-metrics'
import { Loader } from '@/components/ui/loader'
import { SalesMetrics } from '@/components/admin/sales-metrics'

const searchParamSchema = z.object({
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
    .refine((date) => new Date(date) <= new Date(), {
      message: 'End date cannot be in the future',
    })
    .catch(new Date().toISOString()),
})

export const Route = createFileRoute('/admin/dashboard')({
  validateSearch: searchParamSchema,
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

function RouteComponent() {
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
        <Suspense>
          <SalesMetrics />
        </Suspense>
      </div>
    </div>
  )
}
