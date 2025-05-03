import './globals.css';
import type { Metadata, Viewport } from 'next'; // Import Viewport type
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

// CORRECT: Metadata without viewport
export const metadata: Metadata = {
  title: 'VIILASA - Digital Studio',
  description: 'Crafting digital experiences that leave lasting impressions',
  // viewport: 'width=device-width, initial-scale=1, maximum-scale=1', // <-- REMOVE this line
};

// CORRECT: Add the generateViewport function
export function generateViewport(): Viewport {
 return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
 }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="preload"
          href="https://db.onlinewebfonts.com/t/ecce6fb92d2957e8e04867dc281f666b.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://db.onlinewebfonts.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  );
}
