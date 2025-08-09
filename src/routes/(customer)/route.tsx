import { Outlet, createFileRoute } from '@tanstack/react-router'
import { api } from '@convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { AppNavbar } from '@/components/app-navbar'
import { NavbarProvider } from '@/components/ui/navbar'
import { Container } from '@/components/ui/container'

export const Route = createFileRoute('/(customer)')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(
      convexQuery(api.user.getSignedInUser, {}),
    )

    console.log(user)

    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  return (
    <NavbarProvider>
      <AppNavbar user={user} />
      <Container className="py-6 sm:py-12">
        <Outlet />
      </Container>
    </NavbarProvider>
  )
}
