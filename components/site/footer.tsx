export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[color:var(--color-text-soft)]">
        <p>© {new Date().getFullYear()} Lâm Vương</p>
        <div className="flex gap-4">
          <a href="https://github.com" className="hover:underline">GitHub</a>
          <a href="mailto:lamdavid821@gmail.com" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
