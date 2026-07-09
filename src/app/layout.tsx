import type { Metadata, Viewport } from 'next';
import './globals.css';
import { headers } from 'next/headers';

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
  // 服务端根据 pathname 渲染正确的 lang/dir，
  // 确保阿语页在服务端 HTML 即带 dir="rtl"，而非依赖客户端 useEffect。
  const pathname = (headers().get('x-pathname') || '/');
  const seg = pathname.split('/')[1];
  const lang = seg === 'zh' ? 'zh-CN' : seg === 'ar' ? 'ar' : 'en';
  const dir = seg === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
