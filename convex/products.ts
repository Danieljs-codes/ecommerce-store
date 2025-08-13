import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { getUser } from './user'
import type { DataModel, Id } from './_generated/dataModel'
import { GenericDatabaseReader, paginationOptsValidator } from 'convex/server'
import { internal } from './_generated/api'
import { fetchProductStats } from './helpers'
import { TableAggregate } from '@convex-dev/aggregate'
import { components } from './_generated/api'

const productAggregate = new TableAggregate<{
  Namespace: undefined
  Key: number
  DataModel: DataModel
  tableName: 'products'
}>(components.products, {
  namespace: () => undefined,
  sortKey: doc => doc._creationTime
})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueSlug(
  ctx: { db: GenericDatabaseReader<DataModel> },
  name: string,
): Promise<string> {
  const base = slugify(name)
  let candidate = base
  let suffix = 2
  // Ensure uniqueness using the by_slug index
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .unique()
    if (!existing) return candidate
    candidate = `${base}-${suffix++}`
  }
}

export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(), // kobo
    description: v.string(),
    categoryId: v.optional(v.id('categories')),
    tags: v.array(v.string()),
    images: v.array(v.id('_storage')),
    stockCount: v.number(),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('scheduled'),
    ),
    publishAtMs: v.optional(v.number()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    if (!user || user.role !== 'admin') throw new ConvexError('Unauthorized')

    // Validate scheduled publish requirements
    const publishAtMs = args.publishAtMs
    const nowMs = Date.now()
    if (args.status === 'scheduled') {
      if (!publishAtMs) {
        throw new ConvexError('Publish date is required when scheduled')
      }
      if (publishAtMs <= nowMs) {
        throw new ConvexError('Publish date must be in the future')
      }
    }

    const slug = await generateUniqueSlug(ctx, args.name)

    const createdAt = nowMs
    const productId = await ctx.db.insert('products', {
      name: args.name,
      slug,
      description: args.description,
      categoryId: (args.categoryId as Id<'categories'>) ?? undefined,
      price: args.price,
      stockCount: args.stockCount,
      images: args.images,
      tags: args.tags,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      status: args.status,
      publishAt: publishAtMs,
      sellerId: user._id,
      createdAt,
      updatedAt: createdAt,
      isActive: args.status === 'active',
    })

    // If scheduled, enqueue publish job and record scheduled function id
    if (args.status === 'scheduled' && publishAtMs) {
      const scheduledFnId = await ctx.scheduler.runAt(
        publishAtMs,
        internal.products.publishProduct,
        { productId },
      )

      await ctx.db.insert('scheduled_tasks', {
        type: 'publish_product',
        entityId: productId as unknown as string,
        scheduledFunctionId: scheduledFnId,
        scheduledFor: publishAtMs,
        status: 'pending',
        createdAt: nowMs,
      })
    }

    return { id: productId, slug }
  },
})

export const publishProduct = internalMutation({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId)
    if (!product) return

    // Activate the product
    await ctx.db.patch(productId, {
      status: 'active',
      isActive: true,
      updatedAt: Date.now(),
      publishAt: Date.now(),
    })

    // Mark scheduled task as completed
    const tasks = await ctx.db
      .query('scheduled_tasks')
      .withIndex('by_type_entity', (q) =>
        q
          .eq('type', 'publish_product')
          .eq('entityId', productId as unknown as string),
      )
      .collect()

    await Promise.all(
      tasks.map((t) =>
        ctx.db.patch(t._id, {
          status: 'completed',
          completedAt: Date.now(),
        }),
      ),
    )
  },
})

export const getProductsPage = query({
  args: {
    filter: v.optional(
      v.union(v.literal('active'), v.literal('draft'), v.literal('scheduled')),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    if (!user || user.role !== 'admin') throw new Error('Unauthorized')

    let q = ctx.db
      .query('products')
      .withIndex('by_seller', (q) => q.eq('sellerId', user._id))
    if (args.filter) {
      q = q.filter((q) => q.eq(q.field('status'), args.filter))
    }

    return await q.paginate(args.paginationOpts)
  },
})

export const getProductStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    if (!user || user.role !== 'admin') throw new Error('Unauthorized')

    return await fetchProductStats({ ...ctx, userId: user._id })
  },
})
