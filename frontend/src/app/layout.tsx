import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Softlligence Manufacturing Cloud',
  description: 'Multi-tenant manufacturing ERP / MIS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
