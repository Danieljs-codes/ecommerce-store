import { query } from "./_generated/server";
import { betterAuthComponent } from "./auth";
import type { Id } from "./_generated/dataModel";

export const getSignedInUser = query({
  args: {},
  handler: async (ctx) => { 
   // The component provides a convenience method to get the user id
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return null
    }

    const user = await ctx.db.get(userId as Id<"users">);



return user;
  }
})