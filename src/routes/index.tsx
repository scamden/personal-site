import { createFileRoute } from '@tanstack/react-router';

import { ThemeToggle } from '#/components/theme-toggle.tsx';
import { type HeroPiece, type ResourceLink, site } from '#/data/site.ts';

export const Route = createFileRoute('/')({ component: Home });

function heroClass(piece: HeroPiece): string | undefined {
  return [piece.b && 'b', piece.acc && 'acc'].filter(Boolean).join(' ') || undefined;
}

function isExternal(href: string): boolean {
  return href.startsWith('http');
}

function ResourceItem({ link }: { link: ResourceLink }) {
  if (!link.href) {
    return (
      <span className="item soon">
        <span className="t">{link.title}</span>
        <span className="m">{link.meta}</span>
      </span>
    );
  }
  const external = isExternal(link.href);
  return (
    <a
      className="item"
      href={link.href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span className="t">
        {link.title} <span className="arw">{external ? '↗' : '→'}</span>
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
          <p className="kicker reveal">{site.name}</p>

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
                <p className="lbl">{section.label}</p>
                <div>
                  {section.body.map((paragraph) => (
                    <p className="body" key={paragraph.slice(0, 32)}>
                      {paragraph}
                    </p>
                  ))}
                  {section.note ? <p className="body note">{section.note}</p> : null}
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
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
