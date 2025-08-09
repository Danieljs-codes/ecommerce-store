import './polyfills'
import { Resend } from '@convex-dev/resend'
import { render } from '@react-email/render'
import { components } from './_generated/api'
import ForgotPasswordEmail from './emails/forgotPassword'
import type { RunMutationCtx } from '@convex-dev/better-auth'

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
})

export const sendForgotPasswordMail = async (
  ctx: RunMutationCtx,
  {
    to,
    url,
    email,
  }: {
    to: string
    url: string
    email: string
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'Ecommerce App <noreply@olamidee.tech>',
    to,
    subject: 'Reset Your Password - Action Required',
    html: await render(
      <ForgotPasswordEmail resetUrl={url} userEmail={email} />,
    ),
  })
}
