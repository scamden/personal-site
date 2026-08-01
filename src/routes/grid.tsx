import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '#/components/theme-toggle.tsx';
import type { GridEngine, GridMode, GridStats, LifePattern } from '#/grid-demo/engine.ts';
import '#/grid-demo/grid-demo.css';

const MODES = ['universe', 'life', 'data'] as const satisfies readonly GridMode[];

// Persist the active tab in ?mode= so a reload (or a shared link) keeps it.
function validateSearch(search: Record<string, unknown>): { mode: GridMode } {
  const { mode } = search;
  return {
    mode: (MODES as readonly string[]).includes(mode as string) ? (mode as GridMode) : 'universe',
  };
}

export const Route = createFileRoute('/grid')({ component: GridDemo, validateSearch });

const PATTERNS: { value: LifePattern; label: string }[] = [
  { value: 'soup', label: 'Random soup' },
  { value: 'gliders', label: 'Gliders' },
  { value: 'gun', label: 'Gosper gun' },
  { value: 'pulsars', label: 'Pulsars' },
  { value: 'rpentomino', label: 'R-pentomino' },
];
// rows; total field cells = rows * 400 (FIELD_COLS). Bigger = slower one-time
// setup, same steady-state fps.
const SIZES: { value: number; label: string }[] = [
  { value: 5_000, label: '2M cells' },
  { value: 40_000, label: '16M cells' },
  { value: 150_000, label: '60M cells' },
];
// A frame's cost follows the cells on screen, which is viewport area / cell² —
// the window decides what the demo can afford, and the total size does not.
//
// Most of that cost is not in our JS. Writing the styles for a step is ~26ms at
// 21,922 cells; the rest is the browser's style, layout and paint over that many
// nodes, which no timer here can see. Changing the zoom is worse: the library
// rebuilds its element pool, which is every column times the visible rows, so
// 21,922 visible cells churn 45,200 elements — a second of work before anything
// moves again.
//
// The budget below is therefore a taste call about how slow is too slow, not a
// hard limit. At 24,000 a phone and a 16" keep 2x (21,922 cells, visibly slower
// but usable); a 5K screen at 2x asks for 44,902 and doesn't get it.
const CELL_BUDGET = 24_000;
const CELL_STEPS = [18, 24, 36]; // px, finest first
const FALLBACK_CELL = 36;

function cellsOnScreen(cell: number, width: number, height: number): number {
  return Math.ceil(width / cell) * Math.ceil(height / cell);
}
function affordable(cell: number, width: number, height: number): boolean {
  return cellsOnScreen(cell, width, height) <= CELL_BUDGET;
}
// The cell size this window can carry at 1x.
function baseCellFor(width: number, height: number): number {
  return CELL_STEPS.find((cell) => affordable(cell, width, height)) ?? FALLBACK_CELL;
}
// Zoom steps around that base, minus any the window can't afford.
function zoomsFor(width: number, height: number): { value: number; label: string }[] {
  const base = baseCellFor(width, height);
  return [
    { value: base * 2, label: '0.5×' },
    { value: base, label: '1×' },
    { value: base / 2, label: '2×' },
  ].filter((zoom) => affordable(zoom.value, width, height));
}

function subtitleFor(mode: GridMode): string {
  return mode === 'data'
    ? 'The same grid, doing what it was built for.'
    : 'It only ever paints the cells you can actually see.';
}

function GridDemo() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = Route.useNavigate();

  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GridEngine | null>(null);
  // The engine pulls these from refs every frame, so control never depends on
  // the engine promise having resolved yet.
  const modeRef = useRef<GridMode>(initialMode);
  const patternRef = useRef<LifePattern>('soup');
  const resetRef = useRef(0);
  const sizeRef = useRef(SIZES[0]?.value ?? 5_000);
  // the cell size the engine should use: Life's zoom when in Life, the window's
  // base otherwise
  const cellRef = useRef(CELL_STEPS[0] ?? 18);

  const [mode, setMode] = useState<GridMode>(initialMode);
  const [pattern, setPattern] = useState<LifePattern>('soup');
  const [size, setSize] = useState(sizeRef.current);
  // undefined until measured, so server and first client render agree
  const [viewport, setViewport] = useState<{ width: number; height: number } | undefined>(
    undefined,
  );
  const [zoom, setZoom] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<GridStats | null>(null);

  const zooms = viewport ? zoomsFor(viewport.width, viewport.height) : [];
  const baseCell = viewport ? baseCellFor(viewport.width, viewport.height) : (CELL_STEPS[0] ?? 18);
  // a zoom the window can no longer afford (it shrank, or you rotated) falls back
  const activeZoom = zooms.some((z) => z.value === zoom) ? (zoom ?? baseCell) : baseCell;

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let cancelled = false;
    let poll = 0;

    // Dynamic import keeps the browser-only grid out of SSR entirely.
    import('#/grid-demo/engine.ts')
      .then(({ createGridEngine }) =>
        createGridEngine(el, {
          getMode: () => modeRef.current,
          getPattern: () => patternRef.current,
          getResetNonce: () => resetRef.current,
          getFieldRows: () => sizeRef.current,
          getCellSize: () => cellRef.current,
        }).then((engine) => {
          if (cancelled) {
            engine.destroy();
            return;
          }
          engineRef.current = engine;
          // fast enough that the row counter reads like an odometer under a fling
          poll = window.setInterval(() => setStats(engine.stats()), 100);
        }),
      )
      .catch((err) => {
        console.error('grid engine failed to start', err);
      });

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  // What the window can afford changes when the window does — rotating a phone
  // or dragging a corner can put a zoom step in or out of reach.
  useEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Life uses the chosen zoom, everything else the window's base. Kept in a ref
  // because the engine reads it every frame.
  useEffect(() => {
    cellRef.current = mode === 'life' ? activeZoom : baseCell;
  }, [mode, activeZoom, baseCell]);

  const handleMode = (next: GridMode) => {
    modeRef.current = next;
    setMode(next);
    // replace (not push) so the tab buttons don't stack history entries.
    navigate({ search: { mode: next }, replace: true });
  };
  const handlePattern = (next: LifePattern) => {
    patternRef.current = next;
    setPattern(next);
  };
  const handleSize = (next: number) => {
    sizeRef.current = next;
    setSize(next);
  };
  const handleZoom = (next: number) => {
    setZoom(next);
  };
  const handleReset = () => {
    resetRef.current += 1;
  };

  // The engine reports the geometry it actually has; while that lags what the
  // controls asked for, it is mid-rebuild — which at the bigger sizes is long
  // enough to look like a hang.
  const building =
    mode !== 'data' &&
    stats !== null &&
    (stats.rows !== size || stats.cell !== (mode === 'life' ? activeZoom : baseCell));

  return (
    <div className="griddemo">
      <div className="griddemo-canvas" ref={canvasRef} />

      <div className="griddemo-ui">
        <div className="griddemo-top">
          <div className="griddemo-topleft">
            <Link to="/" className="griddemo-back">
              ← sterlingcamden.com
            </Link>
            <ThemeToggle />
          </div>
          <div className="griddemo-title">
            <h1>gridgrid/grid</h1>
            <p>{subtitleFor(mode)}</p>
          </div>
        </div>

        <div className="griddemo-bottom">
          <div className="griddemo-controls">
            {mode !== 'data' ? (
              <div className="griddemo-tools">
                <select
                  className="griddemo-select"
                  value={size}
                  onChange={(e) => handleSize(Number(e.target.value))}
                  aria-label="Grid size"
                >
                  {SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                {mode === 'life' ? (
                  <>
                    <select
                      className="griddemo-select"
                      value={pattern}
                      onChange={(e) => handlePattern(e.target.value as LifePattern)}
                      aria-label="Starting pattern"
                    >
                      {PATTERNS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    {zooms.length > 1 ? (
                      <select
                        className="griddemo-select"
                        value={activeZoom}
                        onChange={(e) => handleZoom(Number(e.target.value))}
                        aria-label="Zoom"
                      >
                        {zooms.map((z) => (
                          <option key={z.value} value={z.value}>
                            {z.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <button type="button" className="griddemo-reset" onClick={handleReset}>
                      ↺ Reset
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}

            <div className="griddemo-modes">
              <button
                type="button"
                data-on={mode === 'universe'}
                onClick={() => handleMode('universe')}
              >
                Universe
              </button>
              <button type="button" data-on={mode === 'life'} onClick={() => handleMode('life')}>
                Game of Life
              </button>
              <button type="button" data-on={mode === 'data'} onClick={() => handleMode('data')}>
                Data grid
              </button>
            </div>
          </div>

          <div className="griddemo-readout">
            <div>
              painting <b>{(stats?.visible ?? 0).toLocaleString()}</b> of{' '}
              <b>{(stats?.total ?? 0).toLocaleString()}</b> cells
            </div>
            <div>
              row <b>{(stats?.row ?? 0).toLocaleString()}</b> of{' '}
              <b>{(stats?.rows ?? 0).toLocaleString()}</b>
            </div>
            <div>
              <b>{stats?.fps ?? 0}</b> fps
            </div>
            <div className="griddemo-hint">
              {building ? 'building the grid…' : 'scroll or fling anywhere'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
