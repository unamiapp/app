import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './client-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'UNCIP App',
  description: 'Child Protection Information System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .prevent-flicker {
            transform: translateZ(0);
            backface-visibility: hidden;
            will-change: auto;
          }
        `}} />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}