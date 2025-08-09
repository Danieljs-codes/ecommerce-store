import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/products')({
  loader: () => {
    return {
      title: 'Products',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/products"!</div>
}
