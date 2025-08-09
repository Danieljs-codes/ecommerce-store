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

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm Password is required'),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    // Only add error to confirmPassword field
    ctx.addIssue({
      code: "custom",
      message: 'Passwords must match',
      path: ['confirmPassword'],
    })
  }
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
