import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { createServerFn } from '@tanstack/react-start'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { getCookie, getWebRequest } from '@tanstack/react-start/server'
import { ThemeProvider } from 'next-themes'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import nProgress from 'nprogress'
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import type { ConvexReactClient } from 'convex/react'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import { fetchSession, getCookieName } from '@/lib/server-auth-utils'
import { authClient } from '@/lib/auth-client'
import { Toast } from '@/components/ui/toast'
import { getFlashCookie } from '@/lib/utils'

// Server side session request
const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const sessionCookieName = await getCookieName()
  const token = getCookie(sessionCookieName)
  const request = getWebRequest()
  const { session } = await fetchSession(request)
  return {
    userId: session?.user.id,
    token,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async (ctx) => {
    // all queries, mutations and action made with TanStack Query will be
    // authenticated by an identity token.
    const auth = await fetchAuth()
    const { userId, token } = auth

    // During SSR only (the only time serverHttpClient exists),
    // set the auth token for Convex to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    const cookie = getFlashCookie()

    return { userId, token, cookie }
  },
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  )
}
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-sans antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider disableTransitionOnChange attribute="class">
          <InnerComponent>{children}</InnerComponent>
          <Toast />
        </ThemeProvider>
        <TanStackRouterDevtools />
        <Scripts />
      </body>
    </html>
  )
}

function InnerComponent({ children }: { children: React.ReactNode }) {
  const router = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      status: state.status,
    }),
  })
  const pathnameRef = useRef(router.pathname)
  const { cookie } = Route.useRouteContext()

  useEffect(() => {
    if (!cookie) return
    setTimeout(
      () =>
        toast[cookie.intent](cookie.message, {
          description: cookie.description,
        }),
      0,
    )
  }, [cookie])

  useEffect(() => {
    const currentPathname = router.pathname
    const pathnameChanged = currentPathname !== pathnameRef.current

    nProgress.configure({
      showSpinner: false,
    })
    if (pathnameChanged && router.status === 'pending') {
      nProgress.start()
      pathnameRef.current = currentPathname
    }

    if (router.status === 'idle') {
      nProgress.done()
    }
  }, [router.pathname, router.status])

  return <>{children}</>
}
