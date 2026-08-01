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
// px per cell, Life only. Every step repaints every visible cell, so zooming out
// buys board at the cost of paint: 9px is ~4x the cells of 18px.
const ZOOMS: { value: number; label: string }[] = [
  { value: 18, label: 'Close' },
  { value: 12, label: 'Wider' },
  { value: 9, label: 'Widest' },
];

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
  const zoomRef = useRef(ZOOMS[0]?.value ?? 18);

  const [mode, setMode] = useState<GridMode>(initialMode);
  const [pattern, setPattern] = useState<LifePattern>('soup');
  const [size, setSize] = useState(sizeRef.current);
  const [zoom, setZoom] = useState(zoomRef.current);
  const [stats, setStats] = useState<GridStats | null>(null);

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
          getLifeCell: () => zoomRef.current,
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
    zoomRef.current = next;
    setZoom(next);
  };
  const handleReset = () => {
    resetRef.current += 1;
  };

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
                    <select
                      className="griddemo-select"
                      value={zoom}
                      onChange={(e) => handleZoom(Number(e.target.value))}
                      aria-label="Zoom"
                    >
                      {ZOOMS.map((z) => (
                        <option key={z.value} value={z.value}>
                          {z.label}
                        </option>
                      ))}
                    </select>
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
            <div className="griddemo-hint">scroll or fling anywhere</div>
          </div>
        </div>
      </div>
    </div>
  );
}
