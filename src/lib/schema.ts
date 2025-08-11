import z from 'zod/v4'

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(
      /^[a-zA-Z]+\s+[a-zA-Z]+.*$/,
      'Please enter your first and last name separated by a space',
    ),
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export type SignUpSchema = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

export type SignInSchema = z.infer<typeof signInSchema>

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required'),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Confirm Password is required'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      // Only add error to confirmPassword field
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords must match',
        path: ['confirmPassword'],
      })
    }
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

// Step 1: Product Details (combines basics + images)
export const productDetailsSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  basePrice: z.number().min(100, 'Price must be at least ₦1 (100 kobo)'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  images: z
    .array(
      z
        .file()
        .refine(
          (file) => file.size <= 2 * 1024 * 1024, // 2MB
          { message: 'Each image must be less than 2MB' },
        )
        .mime(['image/png', 'image/jpeg', 'image/webp']),
    )
    .min(1, 'At least one image is required'),
})

// Step 2: Variants & Publishing (combines variants + publish)
export const productVariantsPublishSchema = z.object({
  hasVariants: z.boolean(),
  variantOptions: z.array(z.string()).optional(),
  stockCount: z.number().min(0).optional(), // For simple products
  variants: z
    .array(
      z.object({
        variantCode: z.string(),
        options: z.record(z.string(), z.string()),
        stockCount: z.number().min(0),
        price: z.number().optional(),
        sku: z.string().optional(),
      }),
    )
    .optional(),
  status: z.enum(['draft', 'active', 'scheduled']),
  publishAt: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

// Combined schema
export const productFormSchema = z.object({
  ...productDetailsSchema.shape,
  ...productVariantsPublishSchema.shape,
})

export type ProductFormData = z.infer<typeof productFormSchema>
