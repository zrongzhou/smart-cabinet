import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Cabinet - Intelligent Storage Solutions',
  description: 'Leading provider of intelligent storage solutions for modern businesses worldwide.',
  keywords: ['smart cabinet', 'vending machine', 'intelligent locker', 'storage solutions'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
