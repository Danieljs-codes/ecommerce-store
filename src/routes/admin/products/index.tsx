import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '@/components/ui/heading'
import { buttonStyles } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import PlusSignSquareIcon from '@/components/icons/plus-size-square-icon'

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
        <Heading className="sm:text-xl">Products</Heading>
        <Link to="/admin/products/new" className={buttonStyles()}>
          <PlusSignSquareIcon data-slot="icon" />
          New
        </Link>
      </div>
    </div>
  )
}
