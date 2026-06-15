import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  userName?: string | null;
  resetPasswordUrl?: string;
}

export default function ResetPasswordEmail({
  userName = 'there',
  resetPasswordUrl = 'https://finance-os.example.com/reset-password',
}: ResetPasswordEmailProps) {
  const displayName = userName || 'there';
  return (
    <Html lang="en">
      <Preview>Reset your FinanceOS password</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                background: '#09090b',
                card: '#18181b',
                border: '#27272a',
                text: '#f4f4f5',
                muted: '#a1a1aa',
                primary: '#ffffff',
                primaryForeground: '#09090b',
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-background text-text mx-auto my-auto font-sans">
          <Container className="border-border bg-card mx-auto my-[40px] max-w-[465px] rounded-lg border border-solid p-[32px]">
            <Section className="mt-[8px] text-center">
              <Text className="text-primary m-0 text-center text-[20px] font-bold tracking-tight">
                FinanceOS
              </Text>
            </Section>

            <Hr className="border-border my-[24px] border-solid" />

            <Heading className="text-primary my-[16px] p-0 text-left text-[24px] leading-[32px] font-semibold">
              Reset your password
            </Heading>

            <Text className="text-text text-[14px] leading-[24px]">
              Hello {displayName},
            </Text>

            <Text className="text-muted mt-[12px] text-[14px] leading-[24px]">
              We received a request to reset the password for your FinanceOS
              account. To set a new password, please click the button below:
            </Text>

            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="bg-primary text-primaryForeground box-border inline-block rounded-[6px] px-[24px] py-[12px] text-center text-[14px] font-medium no-underline"
                href={resetPasswordUrl}
              >
                Reset Password
              </Button>
            </Section>

            <Text className="text-muted text-[12px] leading-[20px]">
              If the button above does not work, you can copy and paste the
              following URL into your web browser:
            </Text>

            <Text className="text-primary mt-[8px] text-[12px] leading-[20px] break-all">
              <Link href={resetPasswordUrl} className="text-primary underline">
                {resetPasswordUrl}
              </Link>
            </Text>

            <Hr className="border-border my-[24px] border-solid" />

            <Text className="text-muted mt-[16px] text-[12px] leading-[20px]">
              This link is valid for 1 hour. If you did not request a password
              reset, you can safely ignore this email; your password will remain
              unchanged.
            </Text>

            <Text className="text-muted/60 mt-[32px] text-center text-[11px] leading-[18px]">
              © {new Date().getFullYear()} FinanceOS. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordEmail.PreviewProps = {
  userName: 'John Doe',
  resetPasswordUrl:
    'https://finance-os.example.com/reset-password?token=preview-token-123',
} satisfies ResetPasswordEmailProps;
