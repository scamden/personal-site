import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import type { GridEngine, GridMode, GridStats } from '#/grid-demo/engine.ts';
import '#/grid-demo/grid-demo.css';

export const Route = createFileRoute('/grid')({ component: GridDemo });

function GridDemo() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GridEngine | null>(null);
  // The engine pulls the current mode from this ref every frame, so switching
  // never depends on the engine promise having resolved yet.
  const modeRef = useRef<GridMode>('universe');
  const [mode, setMode] = useState<GridMode>('universe');
  const [stats, setStats] = useState<GridStats | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let cancelled = false;
    let poll = 0;

    // Dynamic import keeps the browser-only grid out of SSR entirely.
    import('#/grid-demo/engine.ts')
      .then(({ createGridEngine }) =>
        createGridEngine(el, () => modeRef.current).then((engine) => {
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
            <p>Forty million cells. It only ever paints the ones you can see.</p>
          </div>
        </div>

        <div className="griddemo-bottom">
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
