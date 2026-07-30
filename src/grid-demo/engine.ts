// Imperative engine for the grid demo. Dynamically imported from the route so
// gridgrid/grid (a browser-only, DOM library) never runs during SSR.
//
// The grid handles virtualization and scroll; we take over cell appearance via a
// column builder and drive animation with requestDraw() on our own rAF loop.

import type { Grid } from 'grid/dist/modules/core';
import { create as makeSimpleGrid } from 'grid/dist/modules/simple-grid';
import 'grid/dist/css.css';

export type GridMode = 'universe' | 'life';
export type GridStats = { fps: number; visible: number; total: number; mode: GridMode };
export type GridEngine = {
  stats: () => GridStats;
  destroy: () => void;
};

// simple-grid materializes one descriptor per row/col, so these are bounded by
// what we can build up-front; rendering itself only ever touches the visible window.
// 40k x 1k = 40 million cells. Only rows+cols (~41k) descriptors are materialized
// up-front; rendering only ever touches the visible window. Columns are kept
// modest (the grid does more per-column setup work); this builds fast and is
// easy to tune up on real hardware.
const ROWS = 40_000;
const COLS = 1_000;
const CELL = 15;

// Life runs on a bounded torus board that tiles infinitely across the grid.
const LIFE_H = 220;
const LIFE_W = 220;
const LIFE_STEP_MS = 90;

const PALETTE_N = 256;
const UNIVERSE_PALETTE = buildUniversePalette(PALETTE_N);
const LIFE_ALIVE = '#7fd4e6';
const LIFE_DEAD = '#0c0f13';

function buildUniversePalette(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const hue = Math.round((i / n) * 360);
    out.push(`hsl(${hue} 72% 56%)`);
  }
  return out;
}

function clampIndex(value: number, n: number): number {
  if (value < 0) return 0;
  if (value >= n) return n - 1;
  return value;
}

export async function createGridEngine(
  container: HTMLElement,
  getMode: () => GridMode,
): Promise<GridEngine> {
  const grid: Grid = makeSimpleGrid(ROWS, COLS, [CELL], [CELL], 0, 0, undefined, 0, 0, {
    snapToCell: false,
    allowEdit: false,
  });

  let mode: GridMode = getMode();
  let time = 0;
  let painted = 0; // cells drawn in the most recent frame

  // --- Game of Life state (torus) ---
  let board: Uint8Array = seedLife();
  let scratch: Uint8Array = new Uint8Array(LIFE_H * LIFE_W);
  let lifeAccMs = 0;

  function seedLife(): Uint8Array {
    const b = new Uint8Array(LIFE_H * LIFE_W);
    for (let i = 0; i < b.length; i++) {
      b[i] = Math.random() < 0.32 ? 1 : 0;
    }
    stampGlider(b, 4, 4);
    stampGlider(b, 40, 80);
    stampGlider(b, 120, 30);
    return b;
  }

  function stampGlider(b: Uint8Array, row: number, col: number) {
    const cells = [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ];
    for (const [dr, dc] of cells) {
      const r = (row + (dr ?? 0)) % LIFE_H;
      const c = (col + (dc ?? 0)) % LIFE_W;
      b[r * LIFE_W + c] = 1;
    }
  }

  function stepLife() {
    for (let r = 0; r < LIFE_H; r++) {
      const up = ((r - 1 + LIFE_H) % LIFE_H) * LIFE_W;
      const mid = r * LIFE_W;
      const down = ((r + 1) % LIFE_H) * LIFE_W;
      for (let c = 0; c < LIFE_W; c++) {
        const left = (c - 1 + LIFE_W) % LIFE_W;
        const right = (c + 1) % LIFE_W;
        const n =
          (board[up + left] ?? 0) +
          (board[up + c] ?? 0) +
          (board[up + right] ?? 0) +
          (board[mid + left] ?? 0) +
          (board[mid + right] ?? 0) +
          (board[down + left] ?? 0) +
          (board[down + c] ?? 0) +
          (board[down + right] ?? 0);
        const alive = board[mid + c] ?? 0;
        scratch[mid + c] = n === 3 || (alive === 1 && n === 2) ? 1 : 0;
      }
    }
    const swap = board;
    board = scratch;
    scratch = swap;

    // Keep the field perpetually churning: sprinkle a little new life each step.
    for (let k = 0; k < 60; k++) {
      board[(Math.random() * board.length) | 0] = 1;
    }
  }

  // --- Per-cell color ---
  function colorFor(virtualRow: number, virtualCol: number): string {
    if (mode === 'life') {
      const r = virtualRow % LIFE_H;
      const c = virtualCol % LIFE_W;
      return board[r * LIFE_W + c] === 1 ? LIFE_ALIVE : LIFE_DEAD;
    }
    const v =
      Math.sin(virtualRow * 0.06 + time) +
      Math.sin(virtualCol * 0.06 + time * 0.9) +
      Math.sin((virtualRow + virtualCol) * 0.045 + time * 0.5);
    const idx = clampIndex(((v / 6 + 0.5) * PALETTE_N) | 0, PALETTE_N);
    return UNIVERSE_PALETTE[idx] ?? UNIVERSE_PALETTE[0] ?? LIFE_DEAD;
  }

  // Track every currently-mounted cell element and its coordinates. The grid
  // reuses a bounded pool of elements and calls update() as cells scroll, so this
  // map stays small and current. We recolor these ourselves each frame, which is
  // what animates the field (requestDraw doesn't re-run builders for cells that
  // haven't scrolled).
  const liveCells = new Map<HTMLElement, { r: number; c: number }>();
  const builder = grid.colModel.createBuilder(
    () => {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;inset:0';
      return el;
    },
    (el, ctx) => {
      if (el) {
        liveCells.set(el, { r: ctx.virtualRow, c: ctx.virtualCol });
        el.style.background = colorFor(ctx.virtualRow, ctx.virtualCol);
      }
      return el;
    },
  );
  for (let c = 0; c < grid.colModel.length(); c++) {
    grid.colModel.get(c).builder = builder;
  }

  grid.build(container);

  // --- Animation loop (decoupled from the grid's internal draw scheduling) ---
  let raf = 0;
  let last = 0;
  let fps = 0;
  let frameCount = 0;
  let fpsAcc = 0;

  function frame(ts: number) {
    const dt = last ? ts - last : 16;
    last = ts;

    fpsAcc += dt;
    frameCount++;
    if (fpsAcc >= 250) {
      fps = Math.round((frameCount * 1000) / fpsAcc);
      fpsAcc = 0;
      frameCount = 0;
    }

    const nextMode = getMode();
    if (nextMode !== mode) {
      mode = nextMode;
      if (mode === 'life') {
        board = seedLife();
        lifeAccMs = 0;
      }
    }

    if (mode === 'universe') {
      time += dt * 0.0012;
    } else {
      lifeAccMs += dt;
      if (lifeAccMs >= LIFE_STEP_MS) {
        lifeAccMs = 0;
        stepLife();
      }
    }

    for (const [el, pos] of liveCells) {
      el.style.background = colorFor(pos.r, pos.c);
    }
    painted = liveCells.size;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    stats: () => ({ fps, visible: painted, total: ROWS * COLS, mode }),
    destroy: () => {
      cancelAnimationFrame(raf);
      grid.destroy();
      container.innerHTML = '';
    },
  };
}
