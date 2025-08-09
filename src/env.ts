import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),
    CONVEX_DEPLOYMENT: z.string().min(1),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_CONVEX_URL: z.url(),
    VITE_CONVEX_SITE_URL: z.url(),
    VITE_APP_URL: z.url(),
  },

  // Use process.env for server vars, import.meta.env for client vars
  runtimeEnv: {
    // Server variables from process.env
    SERVER_URL: process.env.SERVER_URL,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    
    // Client variables from import.meta.env
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
    VITE_CONVEX_SITE_URL: import.meta.env.VITE_CONVEX_SITE_URL,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
  },

  emptyStringAsUndefined: true,
})
