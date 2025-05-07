import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Web3Provider } from '@/components/Web3Provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'optic.social',
  description: 'add description later',
};

const interVariable = localFont({
  src: '../../public/assets/fonts/InterVariable.woff2',
  display: 'swap',
  variable: '--font-inter',
});

const openRunde = localFont({
  src: [
    {
      path: '../../public/assets/fonts/openrunde/Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/openrunde/Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/openrunde/Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/openrunde/Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-openrunde',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png" />
        <link rel="icon" href="/assets/favicons/favicon.ico" sizes="any" />
      </head>
      <body className={`antialiased ${interVariable.variable} ${openRunde.variable}`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
