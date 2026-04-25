import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AMU Assistant — Your Guide to Aligarh Muslim University',
  description:
    'Get instant answers about Aligarh Muslim University — admissions, departments, campus facilities, hostel information, scholarships, and more. Powered by AI.',
  keywords: [
    'AMU',
    'Aligarh Muslim University',
    'admissions',
    'chatbot',
    'assistant',
    'university guide',
  ],
  openGraph: {
    title: 'AMU Assistant',
    description:
      'AI-powered assistant for Aligarh Muslim University information',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
