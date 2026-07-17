import type { Metadata } from 'next';
import './globals.css';
import { Inter, Geist_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AnchoredToastProvider, ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://financeos.heykaran.dev'),
  title: 'Finance OS',
  description:
    'A modern financial platform for managing your money, investments, and financial future.',
  openGraph: {
    title: 'Finance OS',
    description:
      'A modern financial platform for managing your money, investments, and financial future.',
    url: '/',
    siteName: 'Finance OS',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance OS',
    description:
      'A modern financial platform for managing your money, investments, and financial future.',
    images: ['/twitter-image.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://financeos.heykaran.dev/#website',
        url: 'https://financeos.heykaran.dev/',
        name: 'Finance OS',
        description:
          'A modern financial platform for managing your money, investments, and financial future.',
        publisher: {
          '@id': 'https://financeos.heykaran.dev/#organization',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://financeos.heykaran.dev/#organization',
        name: 'Finance OS',
        url: 'https://financeos.heykaran.dev/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://financeos.heykaran.dev/logo.png',
        },
        sameAs: [
          'https://twitter.com/financeos',
          'https://github.com/financeos',
        ],
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        'font-sans',
        inter.variable,
        geistMono.variable,
      )}
    >
      <body
        className="antialiased selection:bg-emerald-200 selection:text-emerald-900 dark:selection:bg-emerald-800/50 dark:selection:text-emerald-50"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <TooltipProvider>
              <AnchoredToastProvider>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
                  }}
                />
                {children}
              </AnchoredToastProvider>
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
