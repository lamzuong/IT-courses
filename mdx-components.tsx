// mdx-components.tsx
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/mdx/code-block';
import { Callout } from '@/components/mdx/callout';
import { Demo } from '@/components/mdx/demo';
import { Recap } from '@/components/mdx/recap';
import { Term } from '@/components/mdx/term';
import { SectionHeading } from '@/components/mdx/section-heading';
import { Pattern } from '@/components/mdx/english/pattern';
import { Vocab } from '@/components/mdx/english/vocab';
import { Dialogue } from '@/components/mdx/english/dialogue';
import { Mistake } from '@/components/mdx/english/mistake';
import { Grammar } from '@/components/mdx/english/grammar';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock>{props.children}</CodeBlock>,
    h2: SectionHeading,
    Callout,
    Demo,
    Recap,
    Term,
    Pattern,
    Vocab,
    Dialogue,
    Mistake,
    Grammar,
  };
}
