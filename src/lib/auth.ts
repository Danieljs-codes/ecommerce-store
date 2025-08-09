import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { betterAuthComponent } from "@convex/auth";
import { sendForgotPasswordMail } from "@convex/email";
import { requireMutationCtx } from "@convex-dev/better-auth/utils";
import type { GenericCtx } from "@convex/_generated/server";

// You'll want to replace this with an environment variable
const siteUrl = "http://localhost:3000";

export const createAuth = (ctx: GenericCtx) =>
  // Configure your Better Auth instance here
  betterAuth({
    // All auth requests will be proxied through your TanStack Start server
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),

    // Simple non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        
        await sendForgotPasswordMail(requireMutationCtx(ctx), {
          to: user.email,
          url,
          email: user.email,
        });
      }
    },
    plugins: [
      // The Convex plugin is required
      convex(),
    ],
  });