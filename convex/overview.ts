import { ConvexError, v } from 'convex/values'
import { query } from './_generated/server'
import { getUser } from './user'

// Sale statuses considered as revenue-generating
const SALE_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered'] as const
type SaleStatus = typeof SALE_STATUSES[number]
const SALE_STATUS_SET = new Set<SaleStatus>(SALE_STATUSES)

export const getOverviewData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    if (!user) throw new ConvexError('User not found')
    if (user.role !== 'admin') throw new ConvexError('Unauthorized')

    const now = Date.now()
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    const since = now - THIRTY_DAYS_MS
    const prevSince = since - THIRTY_DAYS_MS

    const [ordersLast30d, ordersPrev30d, allProducts, productsAddedLast30d] = await Promise.all([
      ctx.db
        .query('orders')
        .withIndex('by_created_at', (q) => q.gte('createdAt', since))
        .collect(),
      ctx.db
        .query('orders')
        .withIndex('by_created_at', (q) => q.gte('createdAt', prevSince))
        .filter((q) => q.lt(q.field('createdAt'), since))
        .collect(),
      ctx.db.query('products').collect(),
      ctx.db
        .query('products')
        .filter((q) => q.gte(q.field('createdAt'), since))
        .collect(),
    ])

    const revenue30d = ordersLast30d.reduce((sum, o) => sum + o.total, 0)
    const revenuePrev30d = ordersPrev30d.reduce((sum, o) => sum + o.total, 0)
    const ordersCount30d = ordersLast30d.length
    const ordersCountPrev30d = ordersPrev30d.length
    const productsCountTotal = allProducts.length
    const productsAdded30d = productsAddedLast30d.length

    const makeChange = (curr: number, prev: number) => {
      const delta = curr - prev
      const pct = prev === 0 ? null : (delta / prev) * 100
      const direction: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
      return { pct, delta, direction }
    }

    const revenueChange = makeChange(revenue30d, revenuePrev30d)
    const ordersChange = makeChange(ordersCount30d, ordersCountPrev30d)

    return {
      revenue30d,
  revenueChange,
      ordersCount30d,
  ordersChange,
      productsCountTotal,
      productsAdded30d,
      since,
      prevSince,
    }
  },
})


// ...existing code...

export const getRecentSalesData = query({
  args: {
    // Date
    from: v.number(),
    // Date
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    if (!user) throw new ConvexError('User not found')
    if (user.role !== 'admin') throw new ConvexError('Unauthorized')

    const { from, to } = args
    if (from > to) throw new ConvexError('Invalid date range: from > to')

    // Fetch orders in range
    const ordersInRange = await ctx.db
      .query('orders')
      .withIndex('by_created_at', (q) => q.gte('createdAt', from))
      .filter((q) => q.lte(q.field('createdAt'), to))
      .collect()

  // Count only orders that represent sales
  const saleOrders = ordersInRange.filter((o) => SALE_STATUS_SET.has(o.status as SaleStatus))



    // Daily series (UTC) using arithmetic bucketing
    const MS_PER_DAY = 24 * 60 * 60 * 1000
    const startOfDayUTC = (ts: number) => Math.floor(ts / MS_PER_DAY) * MS_PER_DAY

    const startDay = startOfDayUTC(from)
    const endDay = startOfDayUTC(to)
    const numDays = Math.max(0, Math.floor((endDay - startDay) / MS_PER_DAY) + 1)

    const earnings = new Array<number>(numDays).fill(0)
    if (saleOrders.length > 0) {
      for (const o of saleOrders) {
        const bucket = startOfDayUTC(o.createdAt)
        const idx = Math.floor((bucket - startDay) / MS_PER_DAY)
        if (idx >= 0 && idx < numDays) earnings[idx] += o.total
      }
    }

    // Early return can share the same computation since earnings is zero-filled
    const dailyEarnings = Array.from({ length: numDays }, (_, i) => ({
      day: startDay + i * MS_PER_DAY,
      earnings: earnings[i],
    }))
    if (saleOrders.length === 0) {
      return { dailyEarnings, topProducts: [] as Array<{ productId: string; productName: string; quantity: number; revenue: number }> }
    }

    // Top products (by revenue)
    const itemsByProduct = new Map<
      string,
      { productId: string; productName: string; quantity: number; revenue: number }
    >()

    const itemsArrays = await Promise.all(
      saleOrders.map((o) =>
        ctx.db
          .query('order_items')
          .withIndex('by_order', (q) => q.eq('orderId', o._id))
          .collect(),
      ),
    )

    for (const items of itemsArrays) {
      for (const it of items) {
        const key = `${it.productId}`
        const curr =
          itemsByProduct.get(key) ??
          { productId: key, productName: it.productName, quantity: 0, revenue: 0 }
        curr.quantity += it.quantity
        curr.revenue += it.totalPrice
        itemsByProduct.set(key, curr)
      }
    }

    const topProducts = Array.from(itemsByProduct.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      dailyEarnings, // [{ day: msUTCStartOfDay, earnings }]
      topProducts, // top 5 [{ productId, productName, quantity, revenue }]
    }
  },
})
// ...existing code...