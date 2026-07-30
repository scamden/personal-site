import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';

import { ThemeToggle } from '#/components/theme-toggle.tsx';
import { type Poem, poems } from '#/data/poems.ts';
import { renderProse } from '#/lib/prose.tsx';
import '#/routes/poems.css';

export const Route = createFileRoute('/poems')({
  component: Poems,
  head: () => ({
    meta: [
      { title: 'Poems · Sterling Camden' },
      { name: 'description', content: 'A handful of poems by Sterling Camden.' },
    ],
  }),
});

// Split verbatim text into stanzas (blank-line separated) and lines.
function toStanzas(text: string): string[][] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((stanza) => stanza.split('\n').map((line) => line.replace(/\s+$/, '')))
    .filter((stanza) => stanza.some((line) => line.length > 0));
}

function PoemView({ poem }: { poem: Poem }) {
  return (
    <article className="poem" id={poem.slug}>
      <h2 className="poem-title">
        <a className="poem-anchor" href={`#${poem.slug}`}>
          {poem.title}
          <span className="poem-hash" aria-hidden="true">
            #
          </span>
        </a>
      </h2>
      <div className="poem-body">
        {toStanzas(poem.text).map((stanza, si) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static, order-stable verse
          <p className="stanza" key={si}>
            {stanza.map((line, li) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static, order-stable verse
              <span className="line" key={li}>
                {line}
              </span>
            ))}
          </p>
        ))}
      </div>
      {poem.note ? <p className="poem-note">{renderProse(poem.note)}</p> : null}
    </article>
  );
}

function Poems() {
  // Reveal each poem as it scrolls into view. Falls back to visible when
  // motion is reduced or IntersectionObserver is unavailable.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.poem'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      for (const el of els) el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* without JS the reveal never fires, so keep the poems visible */}
      <noscript>
        <style>{'.poem{opacity:1 !important;transform:none !important;}'}</style>
      </noscript>
      <ThemeToggle />
      <div className="band">
        <div className="wrap">
          <div className="poems-top">
            <Link to="/" className="poems-back">
              ← sterlingcamden.com
            </Link>
          </div>
          <h1 className="poems-title">Poems</h1>
          <p className="poems-intro">
            Some old, some recent, spanning school workshops to now. Left close to how they came.
          </p>
          <div className="poems-list">
            {poems.map((poem) => (
              <PoemView key={poem.slug} poem={poem} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
