import { ConvexError } from 'convex/values'
import { query } from './_generated/server'
import { getUser } from './user'

export const getExistingCategories = query({
  handler: async (ctx) => {
    const user = await getUser(ctx)

    if (!user || user.role !== 'admin') {
      throw new ConvexError('Unauthorized access')
    }

    const categories = await ctx.db
      .query('categories')
      .withIndex('by_active_sort', (q) => q.eq('isActive', true))
      .order('asc')
      .collect()

    return categories.map((category) => ({
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      imageId: category.imageId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    }))
  },
})
