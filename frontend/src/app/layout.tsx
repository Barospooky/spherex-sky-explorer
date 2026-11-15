import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPHEREx & Planet X | Sky Discovery Lab',
  description: 'Explore real infrared observations. Compare epochs. Investigate potential moving objects.',
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
