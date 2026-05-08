import type { Metadata } from 'next';
import { buildBookmarkLookup } from '@/lib/bookmark-lookup';
import { BookmarksList } from '@/components/site/bookmarks-list';

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Lessons you have saved.',
};

export default function BookmarksPage() {
  const lookup = buildBookmarkLookup();

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 md:py-16">
      <header className="agenda-header">
        <h1 className="agenda-title">Bookmarks</h1>
        <p className="agenda-deck">Lessons you have saved across the shelf.</p>
      </header>

      <hr className="agenda-rule" />

      <BookmarksList lookup={lookup} />
    </main>
  );
}
