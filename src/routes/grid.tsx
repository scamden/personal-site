import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import type { GridEngine, GridMode, GridStats, LifePattern } from '#/grid-demo/engine.ts';
import '#/grid-demo/grid-demo.css';

export const Route = createFileRoute('/grid')({ component: GridDemo });

const PATTERNS: { value: LifePattern; label: string }[] = [
  { value: 'soup', label: 'Random soup' },
  { value: 'gliders', label: 'Gliders' },
  { value: 'gun', label: 'Gosper gun' },
  { value: 'pulsars', label: 'Pulsars' },
  { value: 'rpentomino', label: 'R-pentomino' },
];

function subtitleFor(mode: GridMode): string {
  return mode === 'data'
    ? 'The same grid, doing what it was built for.'
    : 'Forty million cells. It only ever paints the ones you can see.';
}

function GridDemo() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GridEngine | null>(null);
  // The engine pulls these from refs every frame, so control never depends on
  // the engine promise having resolved yet.
  const modeRef = useRef<GridMode>('universe');
  const patternRef = useRef<LifePattern>('soup');
  const resetRef = useRef(0);

  const [mode, setMode] = useState<GridMode>('universe');
  const [pattern, setPattern] = useState<LifePattern>('soup');
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
        }).then((engine) => {
          if (cancelled) {
            engine.destroy();
            return;
          }
          engineRef.current = engine;
          poll = window.setInterval(() => setStats(engine.stats()), 250);
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
  };
  const handlePattern = (next: LifePattern) => {
    patternRef.current = next;
    setPattern(next);
  };
  const handleReset = () => {
    resetRef.current += 1;
  };

  return (
    <div className="griddemo">
      <div className="griddemo-canvas" ref={canvasRef} />

      <div className="griddemo-ui">
        <div className="griddemo-top">
          <Link to="/" className="griddemo-back">
            ← sterlingcamden.com
          </Link>
          <div className="griddemo-title">
            <h1>gridgrid/grid</h1>
            <p>{subtitleFor(mode)}</p>
          </div>
        </div>

        <div className="griddemo-bottom">
          <div className="griddemo-controls">
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

            {mode === 'life' ? (
              <div className="griddemo-life">
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
                <button type="button" className="griddemo-reset" onClick={handleReset}>
                  ↺ Reset
                </button>
              </div>
            ) : null}
          </div>

          <div className="griddemo-readout">
            <div>
              painting <b>{(stats?.visible ?? 0).toLocaleString()}</b> of{' '}
              <b>{(stats?.total ?? 0).toLocaleString()}</b> cells
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
