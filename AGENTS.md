# Rules for AI Agents

Personal site for Sterling Camden — `sterlingcamden.com`. TanStack Start (React 19 + Vite),
TypeScript, Biome. One quiet single page today; room to grow into podcast/writing routes.

## Where things live

- `src/data/site.ts` — **all page content** (hero, sections, links, photo, social). Edit copy here,
  not in JSX. The hero is a list of pieces so any word can be bold (`b`) or slate-accented (`acc`).
- `src/routes/index.tsx` — the page, rendered from `site`.
- `src/routes/__root.tsx` — document shell, `<head>`, favicons, and the no-flash theme script.
- `src/components/` — reusable components (kebab-case files, named exports).
- `src/styles.css` — the whole design system as CSS custom properties (`--paper`, `--ink`,
  `--accent`, …) with light + dark token sets. Style through the tokens; never hardcode colors.

## Core workflow

- Understand the existing system before changing it. Preserve unrelated changes in a dirty worktree.
- Use `pnpm`; never `npm`. Keep Git commands non-interactive.
- Before new work, fetch the remote and base off the latest default branch, not a stale local one.
- Never commit or push directly to the default branch — use a feature branch.
- Add durable guidance to this file, not private per-agent memory.

## Engineering posture

Discover the true shape of the system and represent it as simply and accurately as possible. Before
adding complexity, ask whether the representation is wrong. Prefer one source of truth per fact,
explicit schemas at boundaries, invalid states made unrepresentable, composition over special cases,
and deleting code over adding it. Code is the source of truth; prefer self-explanatory code over
comments, and record discovered debt instead of relying on memory.

## Code quality

- Simple, readable, testable code. Reuse existing patterns and stdlib before adding anything.
- Handle edge cases first with guard clauses; keep the happy path last.
- Prefer focused functions over boolean flags or broad option bags.
- Search for an existing solution before writing new code.

## TypeScript

- Named exports; avoid default exports except where a framework requires them (route `Route`).
- No enums or namespaces — prefer string-literal unions. Prefer `type` over `interface`.
- Avoid `any`, non-null assertions, and type assertions. Let inference work.
- Use full import paths with the `#/*` alias and explicit `.ts`/`.tsx` extensions.
- Use `undefined`, not `null`, for new internal APIs.
- Run the formatter after edits so imports are organized.

## React

- Separate concepts into focused components/hooks. Avoid `useEffect` when derived state or events
  express the behavior.
- Components don't set their own outer margin/positioning; parents own layout. Prefer `gap`.
- Prefix event handlers with `handle`; don't define substantial handlers inline.
- Use the design tokens in `styles.css`, never hardcoded colors, in theme-aware UI.

## Testing

- No unit tests yet — the page is static content. The moment a component grows real logic, add a
  Vitest `*.test.tsx` beside it and work red-green-refactor.

## Verification

Run these before considering work done (this is also what the pre-commit hook approximates):

1. `pnpm run verify-format` — Biome format check.
2. `pnpm run typecheck` — `tsc --noEmit`.
3. `pnpm run lint` — Biome lint.
4. `pnpm run find-unused` — knip (unused files/exports/deps).

`pnpm run check` runs 1–3 together. `pnpm run format` auto-fixes format + imports + lint.

## Git safety

- No destructive Git commands unless explicitly requested and the exact target is verified.
- No force-push, squash, reorder, or retarget without explicit approval.
