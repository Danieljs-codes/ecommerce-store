import { convexQuery } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { setFlashCookie } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/admin/app-sidebar'
import AppSidebarNav from '@/components/admin/app-sidebar-nav'
import { Heading } from '@/components/ui/heading'

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
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav />
        <div className="p-4 lg:p-6">
          <Heading>Basic</Heading>
          <div className="h-[1000px] bg-muted" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
