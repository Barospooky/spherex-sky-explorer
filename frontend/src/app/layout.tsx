import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPHEREx Sky Explorer',
  description: 'Practice starter for a NASA Space Apps SPHEREx sky explorer',
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
