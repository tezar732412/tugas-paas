import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PicPulse - Dynamic Photo Social Platform (Next.js & Supabase)',
  description: 'Platform sosial media berbagi foto dinamis modern dengan fitur CRUD lengkap, Supabase Integration, dan Siap Production Vercel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
