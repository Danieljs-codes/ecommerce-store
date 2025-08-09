import z from "zod/v4";

export const signUpSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z]+\s+[a-zA-Z]+.*$/, "Please enter your first and last name separated by a space"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})


export type SignUpSchema = z.infer<typeof signUpSchema>;