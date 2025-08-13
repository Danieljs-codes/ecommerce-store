// helpers.ts
import type { DataModel, Id } from './_generated/dataModel'
import { GenericDatabaseReader } from 'convex/server'
import { RunQueryCtx } from '@convex-dev/better-auth'

// Helper to compute product stats
export async function fetchProductStats(
  ctx: RunQueryCtx & {
    db: GenericDatabaseReader<DataModel>
    userId: Id<'users'>
  },
) {
  const allProducts = await ctx.db
    .query('products')
    .withIndex('by_seller', (q) => q.eq('sellerId', ctx.userId))
    .collect()

  return {
    totalProducts: allProducts.length,
    activeProducts: allProducts.filter((p) => p.status === 'active').length,
    scheduledProducts: allProducts.filter((p) => p.status === 'scheduled')
      .length,
    inActiveProducts: allProducts.filter((p) => p.status !== 'active' && p.status !== 'scheduled').length,
  }
}
