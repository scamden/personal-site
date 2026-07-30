import { createFileRoute, Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { ThemeToggle } from '#/components/theme-toggle.tsx';
import { type HeroPiece, type ResourceLink, site } from '#/data/site.ts';

export const Route = createFileRoute('/')({ component: Home });

function heroClass(piece: HeroPiece): string | undefined {
  return [piece.b && 'b', piece.acc && 'acc'].filter(Boolean).join(' ') || undefined;
}

function isExternal(href: string): boolean {
  return href.startsWith('http');
}

// Render prose, turning inline [text](href) markdown links into anchors so the
// copy stays the single source of truth. Plain strings pass through untouched.
const INLINE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
function renderProse(text: string): ReactNode {
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

// Small monochrome marker to distinguish a link's destination.
function LinkIcon({ href }: { href: string }) {
  if (href.includes('github.com')) {
    return (
      <svg className="licon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }
  if (href.startsWith('/')) {
    // internal live demo — a grid marker
    return (
      <svg
        className="licon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
        <path d="M3.5 9.5h17M3.5 15h17M9.5 3.5v17M15 3.5v17" />
      </svg>
    );
  }
  if (href.includes('youtu')) {
    // video — a play marker
    return (
      <svg className="licon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10 8.3 16 12 10 15.7Z" fill="currentColor" />
      </svg>
    );
  }
  if (href.includes('soundcloud')) {
    // a little audio waveform
    return (
      <svg className="licon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="3" y="12" width="2" height="6" rx="1" />
        <rect x="7" y="9" width="2" height="9" rx="1" />
        <rect x="11" y="5" width="2" height="13" rx="1" />
        <rect x="15" y="8" width="2" height="10" rx="1" />
        <rect x="19" y="11" width="2" height="7" rx="1" />
      </svg>
    );
  }
  if (href.includes('music.apple')) {
    return (
      <svg className="licon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 8.83 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.31 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    );
  }
  if (href.startsWith('mailto:')) {
    return (
      <svg
        className="licon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (href.includes('linkedin')) {
    return (
      <svg className="licon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67h-3.55V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" />
      </svg>
    );
  }
  return (
    <svg
      className="licon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function ResourceItem({ link }: { link: ResourceLink }) {
  // several small links grouped in one row (e.g. a handful of merged fixes)
  if (link.inline) {
    return (
      <span className="item">
        <span className="t t-inline">
          {link.inline.map((l, i) => (
            <span key={l.href}>
              {i > 0 ? ', ' : ''}
              <a
                className="inline-link"
                href={l.href}
                {...(isExternal(l.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <LinkIcon href={l.href} />
                {l.label}{' '}
                <span className="arw" aria-hidden="true">
                  ↗
                </span>
              </a>
            </span>
          ))}
        </span>
        <span className="m">{link.meta}</span>
      </span>
    );
  }
  if (!link.href) {
    return (
      <span className="item soon">
        <span className="t">{link.title}</span>
        <span className="m">{link.meta}</span>
      </span>
    );
  }
  const external = isExternal(link.href);
  const ext = external ? { target: '_blank', rel: 'noreferrer' } : {};

  // repo + live demo share one row: title links one place, meta links another
  if (link.metaHref) {
    const metaExt = isExternal(link.metaHref) ? { target: '_blank', rel: 'noreferrer' } : {};
    return (
      <div className="item">
        <a className="t t-link" href={link.href} {...ext}>
          <LinkIcon href={link.href} />
          {link.title}{' '}
          {external ? (
            <span className="arw" aria-hidden="true">
              ↗
            </span>
          ) : null}
        </a>
        <a className="m m-link" href={link.metaHref} {...metaExt}>
          <LinkIcon href={link.metaHref} />
          {link.meta}
        </a>
      </div>
    );
  }

  return (
    <a className="item" href={link.href} {...ext}>
      <span className="t">
        <LinkIcon href={link.href} />
        {link.title}{' '}
        {external ? (
          <span className="arw" aria-hidden="true">
            ↗
          </span>
        ) : null}
      </span>
      <span className="m">{link.meta}</span>
    </a>
  );
}

function Home() {
  return (
    <>
      <ThemeToggle />
      <div className="band">
        <div className="wrap">
          <div className="masthead reveal">
            <p className="kicker">{site.name}</p>
            <nav className="topnav">
              <Link to="/grid" search={{ mode: 'universe' }} className="topnav-link">
                the grid
              </Link>
              <a
                href="https://ear-trainer-ynb.pages.dev/"
                target="_blank"
                rel="noreferrer"
                className="topnav-link"
              >
                ear trainer
              </a>
            </nav>
          </div>

          <h1 className="hero reveal d1">
            {site.hero.map((piece, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static, order-stable hero pieces
              <span key={i} className={heroClass(piece)}>
                {piece.t}
              </span>
            ))}
          </h1>

          <div className="sections">
            {site.sections.map((section) => (
              <section className="sec reveal d2" key={section.label}>
                <h2 className="lbl">{section.label}</h2>
                <div>
                  {section.body.map((paragraph) => (
                    <p className="body" key={paragraph.slice(0, 32)}>
                      {renderProse(paragraph)}
                    </p>
                  ))}
                  {section.note ? <p className="body note">{section.note}</p> : null}
                  {section.linksIntro ? <p className="links-intro">{section.linksIntro}</p> : null}
                  {section.links ? (
                    <div className="reslist">
                      {section.links.map((link) => (
                        <ResourceItem key={link.title} link={link} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          <div className="plate-row reveal d3">
            <img
              className="plate"
              src={site.photo.src}
              alt={site.photo.alt}
              width={128}
              height={150}
            />
            <p className="plate-cap">
              <b>{site.photo.captionTitle}</b>
              {site.photo.caption}
            </p>
          </div>

          <p className="invite reveal d4">{site.closing}</p>

          <div className="foot reveal d5">
            {site.social.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(isExternal(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <LinkIcon href={link.href} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
