import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/mdx/code-block';
import { Callout } from '@/components/mdx/callout';
import { Demo } from '@/components/mdx/demo';
import { Recap } from '@/components/mdx/recap';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock>{props.children}</CodeBlock>,
    Callout,
    Demo,
    Recap,
  };
}
