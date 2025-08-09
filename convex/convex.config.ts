import { defineApp } from 'convex/server';
import betterAuth from '@convex-dev/better-auth/convex.config';
import rag from "@convex-dev/rag/convex.config";

const app = defineApp()
app.use(betterAuth)
app.use(rag)

export default app