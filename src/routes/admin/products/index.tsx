import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '@/components/ui/heading'
import { buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import PlusSignSquareIcon from '@/components/icons/plus-size-square-icon'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import { z } from 'zod/v4'
import { MetricCard } from '@/components/admin/metric-card'
import { Table } from '@/components/ui/table'
import { formatMoney } from '@/lib/utils'
import { format } from 'date-fns'
import { IconClipboardFill } from '@intentui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconChevronLeft, IconChevronRight } from '@intentui/icons'
import { useSuspenseQueryDeferred } from '@/hooks/use-suspense-query-deferred'
import { usePaginatedQuery } from 'convex/react'

const searchParamSchema = z.object({
  filter: z
    .union([z.literal('active'), z.literal('draft'), z.literal('scheduled')])
    .optional()
    .catch(undefined),
  page: z.number().optional().catch(1),
})

export const Route = createFileRoute('/admin/products/')({
  validateSearch: searchParamSchema,
  loaderDeps: ({ search }) => ({ filter: search.filter, page: search.page }),
  loader: ({ context, deps }) => {
    const paginationOpts = {
      numItems: 10,
      cursor: null,
    }
    context.queryClient.ensureQueryData(
      convexQuery(api.products.getProductStats, {}),
    )
    return {
      title: 'Products',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useSuspenseQueryDeferred(
    convexQuery(api.products.getProductStats, {}),
  )
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.products.getProductsPage,
    { filter: search.filter },
    { initialNumItems: 10 },
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Heading className="sm:text-xl">Products</Heading>
        <Link to="/admin/products/new" className={buttonStyles()}>
          <PlusSignSquareIcon data-slot="icon" />
          New
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Product"
          description="All products in your store"
        >
          <p className="text-2xl font-semibold">{data.totalProducts}</p>
        </MetricCard>
        <MetricCard
          title="Active Product"
          description="Products currently available for sale"
        >
          <p className="text-2xl font-semibold">{data.activeProducts}</p>
        </MetricCard>
        <MetricCard
          title="Inactive Product"
          description="Products not visible to customers"
        >
          <p className="text-2xl font-semibold">{data.inActiveProducts}</p>
        </MetricCard>
        <MetricCard
          title="Scheduled Product"
          description="Products scheduled to be published"
        >
          <p className="text-2xl font-semibold">{data.scheduledProducts}</p>
        </MetricCard>
      </div>
      <div className="mt-8">
        <MetricCard
          title="Product Inventory"
          description="A complete list of all products in your store, including pricing, stock, and status."
          classNames={{
            content: 'p-0 overflow-y-hidden has-[table]:border-t-0',
          }}
        >
          <Table aria-label="Products">
            <Table.Header>
              <Table.Column>#</Table.Column>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Price</Table.Column>
              <Table.Column>Stock</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Created at</Table.Column>
            </Table.Header>
            <Table.Body items={results}>
              {(item) => (
                <Table.Row id={String(item._id)}>
                  <Table.Cell className="text-muted-fg">
                    <div className="flex items-center gap-1">
                      {String(item._id).slice(-4)}...
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(String(item._id))
                        }}
                        title="Copy Product ID"
                        className="p-1 rounded hover:bg-accent transition-colors"
                        type="button"
                      >
                        <IconClipboardFill />
                      </button>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {item.name}
                  </Table.Cell>
                  <Table.Cell className="font-mono tabular-nums font-medium">
                    {formatMoney(item.price)}
                  </Table.Cell>
                  <Table.Cell>{item.stockCount}</Table.Cell>
                  <Table.Cell className="capitalize">
                    <Badge
                      intent={
                        item.status === 'active'
                          ? 'success'
                          : item.status === 'scheduled'
                            ? 'info'
                            : item.status === 'draft'
                              ? 'secondary'
                              : 'outline'
                      }
                    >
                      {item.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(item.createdAt), 'do MMM, yyyy')}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </MetricCard>
        {data.totalProducts > 0 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-fg">
              Showing {results.length} of {data.totalProducts} products
              {isLoading && <span className="ml-2">(Loading...)</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                intent="secondary"
                onPress={() => {
                  // Go to previous page - this would need to be implemented
                  // with a more complex pagination state management
                }}
                isDisabled={true} // Disabled for now as we need to track previous cursors
              >
                <IconChevronLeft />
                Previous
              </Button>
              <Button
                size="sm"
                intent="secondary"
                onPress={() => {
                  loadMore(10)
                }}
                isDisabled={isLoading || status !== 'CanLoadMore'}
              >
                {isLoading ? 'Loading...' : 'Next'}
                <IconChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
