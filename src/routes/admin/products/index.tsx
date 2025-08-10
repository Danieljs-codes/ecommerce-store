import { createFileRoute } from '@tanstack/react-router'
import { IconSquarePlus } from '@intentui/icons'
import { Heading } from '@/components/ui/heading'
import { buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

export const Route = createFileRoute('/admin/products/')({
  loader: () => {
    return {
      title: 'Products',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading className="sm:text-xl mb-6">Products</Heading>
        <Link to="/admin/products/new" className={buttonStyles()}>
          <IconSquarePlus />
          New
        </Link>
      </div>
    </div>
  )
}
