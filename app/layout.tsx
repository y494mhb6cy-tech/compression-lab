import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Reality Compression Lab — Labor Signals',
  description: 'Grounded dashboard for detecting structure formation in labor-market signals.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
