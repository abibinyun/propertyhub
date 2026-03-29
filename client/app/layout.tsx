import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/lib/context/auth-context';
import { CompareProvider } from '@/lib/context/compare-context';
import { CompareBar } from '@/components/client/compare-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { serverApi } from '@/lib/server/api';
import { getToken } from '@/lib/server/auth';
import { User } from '@/types/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'PropertyHub - Jual Beli Sewa Properti Terpercaya di Indonesia',
    template: '%s | PropertyHub',
  },
  description: 'Temukan rumah, apartemen, tanah, dan properti komersial terbaik di Indonesia. Jual, beli, dan sewa properti dengan mudah di PropertyHub.',
  keywords: ['jual rumah', 'sewa apartemen', 'properti indonesia', 'beli tanah', 'listing properti'],
  authors: [{ name: 'PropertyHub' }],
  creator: 'PropertyHub',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: BASE_URL,
    siteName: 'PropertyHub',
    title: 'PropertyHub - Jual Beli Sewa Properti Terpercaya di Indonesia',
    description: 'Temukan rumah, apartemen, tanah, dan properti komersial terbaik di Indonesia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropertyHub - Jual Beli Sewa Properti',
    description: 'Temukan properti terbaik di Indonesia.',
  },
  alternates: { canonical: BASE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser: User | null = null;
  const token = await getToken();
  if (token) {
    initialUser = await serverApi.getMe().catch(() => null);
  }

  return (
    <html lang="id" className={cn('h-full antialiased', inter.variable)}>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider initialUser={initialUser}>
          <CompareProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CompareBar />
          </CompareProvider>
        </AuthProvider>
        {process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'midtrans' && (
          <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
        )}
      </body>
    </html>
  );
}
