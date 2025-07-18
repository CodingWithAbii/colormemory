import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Color Memory',
  description: 'Color Memory is a game that tests your memory of colors.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
