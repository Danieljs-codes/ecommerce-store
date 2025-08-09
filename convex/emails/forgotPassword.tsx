import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const subject = 'Reset your password'
export const previewText =
  'Use this link to reset your password. It expires soon.'

export type ForgotPasswordEmailProps = {
  resetUrl: string
  appName?: string
  userEmail?: string
  supportEmail?: string
  expiresMinutes?: number
}

const base = {
  backgroundColor: '#f7f7f8',
  textColor: '#111827',
  mutedText: '#4b5563',
  border: '#e5e7eb',
  primary: '#009689',
  buttonText: '#ffffff',
}

const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: `1px solid ${base.border}`,
  overflow: 'hidden',
}

const sectionPad: React.CSSProperties = {
  padding: '24px',
}

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  lineHeight: '28px',
  fontWeight: 600,
  color: base.textColor,
  margin: '0 0 8px 0',
}

const textStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: base.mutedText,
  margin: '0 0 16px 0',
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: base.primary,
  color: base.buttonText,
  padding: '12px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 600,
}

export default function ForgotPasswordEmail({
  resetUrl,
  appName = 'Your Account',
  userEmail,
  supportEmail,
  expiresMinutes = 60,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: base.backgroundColor, margin: 0 }}>
        <Container style={containerStyle}>
          <Section style={{ ...sectionPad, paddingBottom: 8 }}>
            <Text style={{ ...textStyle, margin: 0, color: base.textColor }}>
              {appName}
            </Text>
          </Section>

          <Hr style={{ borderColor: base.border, margin: 0 }} />

          <Section style={sectionPad}>
            <h1 style={headingStyle}>Reset your password</h1>
            {userEmail ? (
              <Text style={textStyle}>
                We received a request to reset the password for{' '}
                <strong style={{ color: base.textColor }}>{userEmail}</strong>.
              </Text>
            ) : (
              <Text style={textStyle}>
                We received a request to reset your password.
              </Text>
            )}

            <Section style={{ margin: '16px 0 20px' }}>
              <Button href={resetUrl} style={buttonStyle}>
                Reset password
              </Button>
            </Section>

            <Text style={textStyle}>
              This link will expire in {expiresMinutes} minutes. If you didn’t
              request this, you can safely ignore this email.
            </Text>

            <Text style={{ ...textStyle, marginBottom: 0 }}>
              If the button doesn’t work, copy and paste this URL into your
              browser:
              <br />
              <Link
                href={resetUrl}
                style={{ color: base.primary, textDecoration: 'underline' }}
              >
                {resetUrl}
              </Link>
            </Text>
          </Section>

          <Hr style={{ borderColor: base.border, margin: 0 }} />

          <Section style={{ ...sectionPad, paddingTop: 12 }}>
            <Text style={{ ...textStyle, fontSize: 12, marginBottom: 0 }}>
              {supportEmail ? (
                <>
                  Need help? Contact{' '}
                  <Link
                    href={`mailto:${supportEmail}`}
                    style={{ color: base.primary, textDecoration: 'underline' }}
                  >
                    {supportEmail}
                  </Link>
                  .
                </>
              ) : (
                'Need help? Reply to this email and our team will assist you.'
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
