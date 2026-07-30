import type { ReactNode } from 'react';

export function isExternal(href: string): boolean {
  return href.startsWith('http');
}

// Render text, turning inline [text](href) markdown links into anchors so the
// copy stays the single source of truth. Plain strings pass through untouched.
const INLINE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
export function renderProse(text: string): ReactNode {
  if (!text.includes('](')) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_LINK)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const href = m[2] ?? '';
    out.push(
      <a
        key={start}
        className="prose-link"
        href={href}
        {...(isExternal(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {m[1]}
      </a>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
