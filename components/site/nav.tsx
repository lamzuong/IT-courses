import Link from 'next/link';

export function SiteNav() {
  return (
    <header className="border-b border-[color:var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          IT Courses
        </Link>
        <nav aria-label="Site" className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline">Courses</Link>
          <Link href="/about" className="hover:underline opacity-70">About</Link>
        </nav>
      </div>
    </header>
  );
}
