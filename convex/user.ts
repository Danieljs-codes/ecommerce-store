import { query } from './_generated/server'
import { betterAuthComponent } from './auth'
import type { RunQueryCtx } from '@convex-dev/better-auth'
import type { DataModel, Id } from './_generated/dataModel'
import type { Auth, GenericDatabaseReader } from 'convex/server'

export const getUser = async (
  ctx: RunQueryCtx & { auth: Auth; db: GenericDatabaseReader<DataModel> },
) => {
  const userId = await betterAuthComponent.getAuthUserId(ctx)
  if (!userId) {
    return null
  }

  const user = await ctx.db.get(userId as Id<'users'>)

  return user
}

export const getSignedInUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    
    return user
  },
})
