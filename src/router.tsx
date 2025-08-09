import { createRouter as createTanstackRouter } from '@tanstack/react-router'

// Import the generated route tree
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import Nprogress from 'nprogress'
import { routeTree } from './routeTree.gen'
import { env } from './env'

// Create a new router instance
export const createRouter = () => {
  const CONVEX_URL = env.VITE_CONVEX_URL

  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  })
  const convexQueryClient = new ConvexQueryClient(convex)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })

  // convexQueryClient.connect(queryClient)

  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: {
      queryClient,
      convexClient: convex,
      convexQueryClient,
    },
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  Nprogress.configure({
    showSpinner: false,
  })
  router.subscribe('onBeforeLoad', ({ fromLocation, pathChanged }) => {
    // Don't show the progress bar on initial page load, seems like the onLoad event doesn't fire in that case
    fromLocation && pathChanged && Nprogress.start()
  })
  router.subscribe('onLoad', () => {
    Nprogress.done()
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
