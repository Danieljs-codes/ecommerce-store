import { createFileRoute } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'

export const Route = createFileRoute('/admin/dashboard')({
  loader: () => {
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
      <div className="grid grid-cols-1 md:grid-cols-3">
        <Card className="gap-y-0 bg-secondary/40 py-0">
          <Card.Header className="px-4 pt-2.5 pb-2">
            <Card.Title className="text-base/5">Total Revenue</Card.Title>
            <Card.Description className="text-sm/5.5 text-muted-fg">
              All time summary of your store's revenue
            </Card.Description>
          </Card.Header>
          <Card.Content className="m-1 rounded-[calc(var(--radius-lg)-2.5px)] bg-bg p-(--card-spacing) ring ring-border">
            <div className="text-2xl font-semibold">$12,345.67</div>
            <div className="text-sm text-muted-fg mt-1">$1,200 Today</div>
          </Card.Content>
        </Card>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
