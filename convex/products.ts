import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { getUser } from './user'
import type { DataModel, Id } from './_generated/dataModel'
import { GenericDatabaseReader } from 'convex/server'
import { internal } from './_generated/api'

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

// Should return data shape like this ``` {
// totalProduct: number,
// activeProduct: number
// scheduledProduct: number
// inActiveProduct: number
// product: Array<{}>
// }

export const getProducts = query({
  args: {
    filter: v.optional(
      v.union(v.literal('active'), v.literal('draft'), v.literal('scheduled')),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    if (!user || user.role !== 'admin') throw new ConvexError('Unauthorized')

    // Fetch all products for this seller to compute stats
    const allProducts = await ctx.db
      .query('products')
      .withIndex('by_seller', (q) => q.eq('sellerId', user._id))
      .collect()

    const totalProducts = allProducts.length
    const activeProducts = allProducts.filter(
      (p) => p.status === 'active',
    ).length
    const scheduledProducts = allProducts.filter(
      (p) => p.status === 'scheduled',
    ).length
    const inActiveProducts = allProducts.filter((p) => !p.isActive).length

    // Apply optional filter for returned list
    const filtered = args.filter
      ? allProducts.filter((p) => p.status === args.filter)
      : allProducts

    // Sort by createdAt desc for a consistent UI
    filtered.sort((a, b) => b.createdAt - a.createdAt)

    const product = await Promise.all(
      filtered.map(async (p) => {
        let categoryName: string | null = null
        if (p.categoryId) {
          const cat = await ctx.db.get(p.categoryId as Id<'categories'>)
          categoryName = cat?.name ?? null
        }
        return {
          id: p._id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          categoryName,
          price: p.price,
          stockCount: p.stockCount,
          images: p.images,
          tags: p.tags,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          status: p.status,
          publishAt: p.publishAt,
          isActive: p.isActive,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }
      }),
    )

    return {
      totalProducts,
      activeProducts,
      scheduledProducts,
      inActiveProducts,
      product,
    }
  },
})
