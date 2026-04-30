import Link from 'next/link';

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[color:var(--color-text-soft)]">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1">
            {item.href ? <Link href={item.href} className="hover:text-black hover:underline">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
