import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import {
  Outlet,
  createFileRoute,
  redirect,
  useChildMatches,
} from '@tanstack/react-router'
import { setFlashCookie } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/admin/app-sidebar'
import AppSidebarNav from '@/components/admin/app-sidebar-nav'
import { Container } from '@/components/ui/container'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(
      convexQuery(api.user.getSignedInUser, {}),
    )

    if (!user || user.role !== 'admin') {
      setFlashCookie({
        intent: 'error',
        message: 'You must be an admin to access this page.',
      })
      throw redirect({
        to: '/',
      })
    }

    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const match = useChildMatches()

  const loaderData = match[match.length - 1]?.loaderData

  const title =
    loaderData && 'title' in loaderData && typeof loaderData.title === 'string'
      ? loaderData.title
      : 'Dashboard'

  return (
    <SidebarProvider shortcut="\">
      <AppSidebar user={user} collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav title={title} user={user} />
        <Container className="p-4 lg:p-6 max-w- mx-auto py-0">
          <Outlet />
        </Container>
      </SidebarInset>
    </SidebarProvider>
  )
}
