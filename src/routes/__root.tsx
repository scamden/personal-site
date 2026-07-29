import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';

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
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
      { rel: 'manifest', href: '/favicon/site.webmanifest' },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
