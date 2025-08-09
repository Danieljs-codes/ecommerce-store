import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '@/components/ui/heading'

export const Route = createFileRoute('/(customer)/products')({
  loader: () => {
    return {
      title: 'Products',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Heading>Products Page</Heading>
}
