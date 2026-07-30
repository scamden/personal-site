import { createRootRoute, HeadContent, Link, Scripts } from '@tanstack/react-router';

import { ThemeToggle } from '#/components/theme-toggle.tsx';
import { site } from '#/data/site.ts';
import appCss from '#/styles.css?url';

// Set the theme before first paint so there's no flash of the wrong palette.
// Only an explicit light/dark override is applied; "system" leaves no attribute
// so the prefers-color-scheme fallback in the CSS governs.
const NO_FLASH_THEME = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: site.seo.title },
      { name: 'description', content: site.seo.description },
      { property: 'og:title', content: site.seo.title },
      { property: 'og:description', content: site.seo.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: site.url },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
      { rel: 'manifest', href: '/favicon/site.webmanifest' },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function NotFound() {
  return (
    <>
      <ThemeToggle />
      <div className="band">
        <div className="wrap nf">
          {/* an open ring (ensō with a gap): the unclosed question, turning */}
          <svg className="nf-enso" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="250 39"
            />
          </svg>
          <p className="nf-code">404</p>
          <p className="nf-line">
            Nothing here, which is a smaller mystery than why there’s anything anywhere.
          </p>
          <Link to="/" className="nf-home">
            ← back to something
          </Link>
        </div>
      </div>
    </>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the no-flash script sets data-theme on <html>
    // before hydration, so its attributes intentionally differ from the SSR output.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-paint theme script */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
