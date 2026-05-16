import type { Metadata } from 'next';
import { Manrope, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteNav } from '@/components/site/nav';
import { SiteFooter } from '@/components/site/footer';
import { getSearchIndex } from '@/lib/search-index';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-jb', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'IT Courses', template: '%s · IT Courses' },
  description: 'Hands-on courses on the parts of frontend I find interesting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getSearchIndex();
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('lesson-lang');if(l==='vi'||l==='en')document.documentElement.setAttribute('data-lang',l);}catch(e){}",
          }}
        />
        <SiteNav searchIndex={searchIndex} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
