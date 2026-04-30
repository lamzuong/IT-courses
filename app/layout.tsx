import type { Metadata } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-jb', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'IT Courses', template: '%s · IT Courses' },
  description: 'Hands-on courses on the parts of frontend I find interesting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
