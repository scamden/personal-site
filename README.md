# sterlingcamden.com

Personal site for Sterling Camden. A quiet single page — who I am, what I'm thinking about,
building, singing, and climbing on — with room to grow into podcast and writing sections.

Built with [TanStack Start](https://tanstack.com/start) (React 19 + Vite), TypeScript, and Biome.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Editing content

All copy lives in [`src/data/site.ts`](src/data/site.ts) — hero, sections, links, photo, social.
Edit there, not in the JSX. The design system (colors, type, light/dark) lives as CSS custom
properties in [`src/styles.css`](src/styles.css).

## Checks

```bash
pnpm run check        # format check + typecheck + lint
pnpm run format       # auto-fix format, imports, lint
pnpm run find-unused  # knip
```

## Build

```bash
pnpm build
pnpm preview
```
