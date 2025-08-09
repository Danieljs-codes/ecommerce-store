import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal('admin'), v.literal('customer')),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  // ===== CATEGORIES =====
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id('categories')),
    imageId: v.optional(v.id('_storage')),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_parent', ['parentId'])
    .index('by_active_sort', ['isActive', 'sortOrder']),

  products: defineTable({
    name: v.string(), // "Cotton T-Shirt"
    slug: v.string(), // "cotton-t-shirt"
    description: v.optional(v.string()),
    categoryId: v.optional(v.id('categories')),

    // What makes variants different? e.g., ["color", "size"]
    variantOptions: v.array(v.string()),

    // Base price in kobo (NGN) - variants can override this
    basePrice: v.number(),

    // Which variant to show by default
    defaultVariant: v.optional(v.id('variants')),

    // Media
    images: v.array(v.id('_storage')),

    // SEO & Organization
    tags: v.array(v.string()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),

    // Status & Scheduling
    status: v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('active'),
      v.literal('archived'),
    ),
    publishAt: v.optional(v.number()), // scheduled publish timestamp

    // Admin
    sellerId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_category', ['categoryId'])
    .index('by_seller', ['sellerId'])
    .index('by_scheduled', ['status', 'publishAt']) // for scheduled publishing
    .index('by_active_category', ['isActive', 'categoryId']),

  //  !VARIANTS TABLE !
  variants: defineTable({
    productId: v.id('products'),

    // Simple code like "black-large" or "blue-128gb"
    variantCode: v.string(),

    // What this variant is: { color: "black", size: "large" }
    options: v.record(v.string(), v.string()),

    // Pricing
    price: v.optional(v.number()), // kobo, if empty uses product.basePrice
    compareAtPrice: v.optional(v.number()), // "was" price for discounts

    // Inventory
    stockCount: v.number(),

    // Variant-specific media
    images: v.array(v.id('_storage')),

    // SKU code for admin
    sku: v.optional(v.string()),

    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_product', ['productId'])
    .index('by_product_code', ['productId', 'variantCode'])
    .index('by_product_active', ['productId', 'isActive'])
    .index('by_sku', ['sku']),

  // ===== STORE-WIDE DISCOUNTS =====
  discounts: defineTable({
    name: v.string(), // "Black Friday Sale"
    code: v.optional(v.string()), // "BLACKFRIDAY" - if null, auto-applied
    description: v.optional(v.string()),

    // Discount type
    type: v.union(
      v.literal('percentage'), // 20% off
      v.literal('fixed_amount'), // ₦500 off
    ),
    value: v.number(), // 20 (for 20%) or 50000 (for ₦500 in kobo)

    // Constraints
    minimumOrderAmount: v.optional(v.number()), // kobo
    maximumDiscountAmount: v.optional(v.number()), // kobo cap for percentage
    usageLimit: v.optional(v.number()), // total uses allowed
    usageCount: v.number(), // current usage count

    // Timing
    startsAt: v.number(),
    expiresAt: v.optional(v.number()),

    // Status
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_code', ['code'])
    .index('by_active_dates', ['isActive', 'startsAt', 'expiresAt']),

  // !===== ORDERS & CART =====
  carts: defineTable({
    userId: v.id('users'),
    // Applied discount
    discountId: v.optional(v.id('discounts')),
    discountCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  cart_items: defineTable({
    cartId: v.id('carts'),
    variantId: v.id('variants'),
    quantity: v.number(),
    // Snapshot prices when added
    priceAtAdd: v.number(), // kobo
    createdAt: v.number(),
  })
    .index('by_cart', ['cartId'])
    .index('by_cart_variant', ['cartId', 'variantId']),

  orders: defineTable({
    userId: v.id('users'),
    orderNumber: v.string(), // "ORD-2024-001"

    // Pricing breakdown (all in kobo)
    subtotal: v.number(),
    discountAmount: v.number(),
    shippingFee: v.number(),
    taxAmount: v.number(),
    total: v.number(),

    // Applied discount
    discountId: v.optional(v.id('discounts')),
    discountCode: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('processing'),
      v.literal('shipped'),
      v.literal('delivered'),
      v.literal('cancelled'),
      v.literal('refunded'),
    ),

    // Customer info
    shippingAddress: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      postalCode: v.optional(v.string()),
    }),

    paymentProvider: v.optional(v.string()), // "paystack", "flutterwave"
    paymentReference: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_order_number', ['orderNumber'])
    .index('by_created_at', ['createdAt']),

  order_items: defineTable({
    orderId: v.id('orders'),
    productId: v.id('products'),
    variantId: v.id('variants'),
    quantity: v.number(),

    // Snapshot data at time of order
    productName: v.string(),
    variantCode: v.string(),
    variantOptions: v.record(v.string(), v.string()),
    pricePerItem: v.number(), // kobo
    totalPrice: v.number(), // kobo (pricePerItem * quantity)
  })
    .index('by_order', ['orderId'])
    .index('by_product', ['productId']),

  // ===== SCHEDULED JOBS =====
  scheduled_tasks: defineTable({
    type: v.union(
      v.literal('publish_product'),
      v.literal('activate_discount'),
      v.literal('deactivate_discount'),
    ),
    entityId: v.string(), // product/discount ID
    scheduledFor: v.number(), // timestamp
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index('by_scheduled', ['status', 'scheduledFor'])
    .index('by_type_entity', ['type', 'entityId']),
})
