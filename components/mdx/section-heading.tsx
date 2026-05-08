'use client';
import { usePathname } from 'next/navigation';
import type { HTMLAttributes, ReactNode } from 'react';
import { BookmarkButton } from '@/components/site/bookmark-button';

function nodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeToText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

export function SectionHeading({ id, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const pathname = usePathname();
  const text = nodeToText(children);
  const path = id ? `${pathname}#${id}` : pathname;

  return (
    <h2 {...rest} id={id} className="section-heading">
      {children}
      <BookmarkButton path={path} title={text} />
    </h2>
  );
}
