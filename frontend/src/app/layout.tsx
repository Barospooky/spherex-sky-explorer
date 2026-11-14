import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPHEREx | Sky Discovery Lab',
  description: 'Explore real SPHEREx observations and investigate changes across epochs',
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
