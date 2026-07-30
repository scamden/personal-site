// Imperative engine for the grid demo. Dynamically imported from the route so
// gridgrid/grid (a browser-only, DOM library) never runs during SSR.
//
// Three modes share one canvas:
//   - universe: an animated generative plasma field (small square cells)
//   - life:     a churning Game of Life torus (small square cells)
//   - data:     a normal, nice SaaS data grid (wide cells, frozen header)
// Field modes share geometry (recolor only). Switching to/from `data`, or
// changing the field size, rebuilds the grid.
//
// Perf notes: framerate is bounded by the number of *visible* cells (cell size),
// not the total. So we use reasonably sized cells, recolor Life only when the
// board actually steps, and recolor the plasma at ~30fps. Total size (the "crank
// it up" control) only affects one-time setup cost, not steady-state fps.

import type { Grid } from 'grid/dist/modules/core';
import { create as makeSimpleGrid } from 'grid/dist/modules/simple-grid';
import 'grid/dist/css.css';

export type GridMode = 'universe' | 'life' | 'data';
export type LifePattern = 'soup' | 'gliders' | 'gun' | 'pulsars' | 'rpentomino';
export type GridStats = { fps: number; visible: number; total: number; mode: GridMode };
export type GridEngine = { stats: () => GridStats; destroy: () => void };

export type EngineInputs = {
  getMode: () => GridMode;
  getPattern: () => LifePattern;
  getResetNonce: () => number;
  getFieldRows: () => number; // "crank it up" — total field cells = rows * FIELD_COLS
};

// --- field geometry (universe + life) ---
const FIELD_COLS = 400;
const FIELD_CELL = 18;

// --- life torus ---
const LIFE_H = 220;
const LIFE_W = 220;
const LIFE_STEP_MS = 90;

// --- data grid geometry ---
const DATA_ROWS = 20_000;
const DATA_ROW_H = 40;
type DataCol = { label: string; width: number; align: 'left' | 'right' };
const DATA_COLS: DataCol[] = [
  { label: 'Name', width: 168, align: 'left' },
  { label: 'Email', width: 236, align: 'left' },
  { label: 'Company', width: 156, align: 'left' },
  { label: 'Status', width: 118, align: 'left' },
  { label: 'MRR', width: 96, align: 'right' },
  { label: 'Plan', width: 108, align: 'left' },
  { label: 'Seats', width: 78, align: 'right' },
  { label: 'Signed up', width: 122, align: 'left' },
  { label: 'Last active', width: 118, align: 'left' },
  { label: 'Country', width: 150, align: 'left' },
  { label: 'Region', width: 100, align: 'left' },
  { label: 'Account owner', width: 176, align: 'left' },
  { label: 'Renewal', width: 122, align: 'left' },
  { label: 'Open tickets', width: 118, align: 'right' },
  { label: 'NPS', width: 78, align: 'right' },
  { label: 'Source', width: 130, align: 'left' },
  { label: 'Last invoice', width: 130, align: 'right' },
  { label: 'Health', width: 120, align: 'left' },
  { label: 'Notes', width: 200, align: 'left' },
];
const REGION = ['NA', 'EMEA', 'APAC', 'LATAM'];
const SOURCE = ['Inbound', 'Referral', 'Outbound', 'Partner', 'Event'];
const HEALTH = ['Healthy', 'Healthy', 'At risk', 'Critical'];
const NOTES = ['', '', 'Follow up', 'VIP', 'Expansion', 'Renewal call', 'Churn risk'];

const PALETTE_N = 256;
const UNIVERSE_PALETTE = buildUniversePalette(PALETTE_N);
// Life colors flip with the theme so the dead cells match the page background.
const LIFE_ALIVE_DARK = '#7fd4e6';
const LIFE_ALIVE_LIGHT = '#0e7490';
const LIFE_DEAD_DARK = '#121517';
const LIFE_DEAD_LIGHT = '#f6f7f8';

function buildUniversePalette(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(`hsl(${Math.round((i / n) * 360)} 72% 56%)`);
  return out;
}
function clampIndex(v: number, n: number): number {
  return v < 0 ? 0 : v >= n ? n - 1 : v;
}
function layoutFor(mode: GridMode): 'field' | 'data' {
  return mode === 'data' ? 'data' : 'field';
}
function currentIsDark(): boolean {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// --- deterministic fake data for the SaaS grid ---
const FIRST = [
  'Ava',
  'Liam',
  'Noah',
  'Emma',
  'Oliver',
  'Mia',
  'Ethan',
  'Sofia',
  'Lucas',
  'Isla',
  'Mason',
  'Aria',
  'Leo',
  'Zoe',
  'Kai',
  'Nora',
  'Jonah',
  'Ruby',
  'Ezra',
  'Iris',
];
const LAST = [
  'Chen',
  'Patel',
  'Kim',
  'Nguyen',
  'Silva',
  'Rossi',
  'Haddad',
  'Berg',
  'Costa',
  'Mbeki',
  'Novak',
  'Reyes',
  'Frost',
  'Dubois',
  'Okafor',
  'Sato',
  'Lund',
  'Vega',
  'Ashby',
  'Moreau',
];
const COMPANY = [
  'Northwind',
  'Acme',
  'Globex',
  'Umbra',
  'Contoso',
  'Initech',
  'Hooli',
  'Vandelay',
  'Soylent',
  'Cyberdyne',
  'Wonka',
  'Tyrell',
  'Gringotts',
  'Aperture',
  'Oscorp',
  'Massive Dynamic',
];
const STATUS = [
  'Active',
  'Active',
  'Active',
  'Active',
  'Trialing',
  'Trialing',
  'Past due',
  'Churned',
];
const PLAN = ['Free', 'Starter', 'Pro', 'Business', 'Enterprise'];
const COUNTRY = [
  'United States',
  'Canada',
  'Brazil',
  'Germany',
  'France',
  'Nigeria',
  'India',
  'Japan',
  'Norway',
  'Portugal',
];
const STATUS_COLOR: Record<string, string> = {
  Active: '#3fa96b',
  Trialing: '#c69214',
  'Past due': '#d8613b',
  Churned: '#8a929a',
};

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length] as T;
}
function hash(row: number, salt: number): number {
  return (Math.imul(row + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0;
}
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
function cellText(row: number, col: number): string {
  const first = pick(FIRST, hash(row, 1));
  const last = pick(LAST, hash(row, 2));
  const company = pick(COMPANY, hash(row, 3));
  switch (col) {
    case 0:
      return `${first} ${last}`;
    case 1:
      return `${first}.${last}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`;
    case 2:
      return company;
    case 3:
      return pick(STATUS, hash(row, 4));
    case 4:
      return `$${(hash(row, 5) % 200) * 5 + 5}`;
    case 5:
      return pick(PLAN, hash(row, 6));
    case 6:
      return `${(hash(row, 7) % 50) + 1}`;
    case 7:
      return `2023-${pad2((hash(row, 8) % 12) + 1)}-${pad2((hash(row, 9) % 28) + 1)}`;
    case 8:
      return `${(hash(row, 10) % 30) + 1}d ago`;
    case 9:
      return pick(COUNTRY, hash(row, 11));
    case 10:
      return pick(REGION, hash(row, 12));
    case 11:
      return `${pick(FIRST, hash(row, 13))} ${pick(LAST, hash(row, 14))}`;
    case 12:
      return `2024-${pad2((hash(row, 15) % 12) + 1)}-${pad2((hash(row, 16) % 28) + 1)}`;
    case 13:
      return `${hash(row, 17) % 12}`;
    case 14:
      return `${(hash(row, 18) % 101) - 20}`;
    case 15:
      return pick(SOURCE, hash(row, 19));
    case 16:
      return `$${(hash(row, 20) % 400) * 5 + 20}`;
    case 17:
      return pick(HEALTH, hash(row, 21));
    default:
      return pick(NOTES, hash(row, 22));
  }
}

export async function createGridEngine(
  container: HTMLElement,
  inputs: EngineInputs,
): Promise<GridEngine> {
  const { getMode, getPattern, getResetNonce, getFieldRows } = inputs;

  let grid: Grid | null = null;
  let layout: 'field' | 'data' | null = null;
  let total = 0;
  let fieldRows = getFieldRows();

  const liveCells = new Map<HTMLElement, { r: number; c: number }>();
  let mode: GridMode = getMode();
  let isDark = currentIsDark();
  let time = 0;
  let painted = 0;
  let uniTick = 0;

  // Life state
  let board: Uint8Array = new Uint8Array(LIFE_H * LIFE_W);
  let scratch: Uint8Array = new Uint8Array(LIFE_H * LIFE_W);
  let lifeAccMs = 0;
  let lastPattern: LifePattern = getPattern();
  let lastResetNonce = getResetNonce();

  function idx(r: number, c: number): number {
    return (((r % LIFE_H) + LIFE_H) % LIFE_H) * LIFE_W + (((c % LIFE_W) + LIFE_W) % LIFE_W);
  }
  function stamp(cells: number[][], row: number, col: number) {
    for (const cell of cells) board[idx(row + (cell[0] ?? 0), col + (cell[1] ?? 0))] = 1;
  }
  function seedLife(pattern: LifePattern) {
    board.fill(0);
    if (pattern === 'soup') {
      for (let i = 0; i < board.length; i++) board[i] = Math.random() < 0.32 ? 1 : 0;
    } else if (pattern === 'gliders') {
      const g = [
        [0, 1],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2],
      ];
      for (let r = 6; r < LIFE_H - 6; r += 26)
        for (let c = 6; c < LIFE_W - 6; c += 26) stamp(g, r, c);
    } else if (pattern === 'rpentomino') {
      stamp(
        [
          [0, 1],
          [0, 2],
          [1, 0],
          [1, 1],
          [2, 1],
        ],
        (LIFE_H >> 1) - 1,
        (LIFE_W >> 1) - 1,
      );
    } else if (pattern === 'pulsars') {
      const p = pulsarCells();
      stamp(p, 40, 40);
      stamp(p, 40, 140);
      stamp(p, 140, 90);
    } else {
      stamp(gosperGun(), 20, 20);
      stamp(gosperGun(), 120, 120);
    }
    lifeAccMs = 0;
  }
  function stepLife() {
    for (let r = 0; r < LIFE_H; r++) {
      const up = ((r - 1 + LIFE_H) % LIFE_H) * LIFE_W;
      const mid = r * LIFE_W;
      const down = ((r + 1) % LIFE_H) * LIFE_W;
      for (let c = 0; c < LIFE_W; c++) {
        const l = (c - 1 + LIFE_W) % LIFE_W;
        const rt = (c + 1) % LIFE_W;
        const n =
          (board[up + l] ?? 0) +
          (board[up + c] ?? 0) +
          (board[up + rt] ?? 0) +
          (board[mid + l] ?? 0) +
          (board[mid + rt] ?? 0) +
          (board[down + l] ?? 0) +
          (board[down + c] ?? 0) +
          (board[down + rt] ?? 0);
        scratch[mid + c] = n === 3 || ((board[mid + c] ?? 0) === 1 && n === 2) ? 1 : 0;
      }
    }
    const swap = board;
    board = scratch;
    scratch = swap;
    if (lastPattern === 'soup') {
      for (let k = 0; k < 60; k++) board[(Math.random() * board.length) | 0] = 1;
    }
  }

  function fieldColor(r: number, c: number): string {
    if (mode === 'life') {
      const alive = isDark ? LIFE_ALIVE_DARK : LIFE_ALIVE_LIGHT;
      const dead = isDark ? LIFE_DEAD_DARK : LIFE_DEAD_LIGHT;
      return board[idx(r, c)] === 1 ? alive : dead;
    }
    const v =
      Math.sin(r * 0.06 + time) +
      Math.sin(c * 0.06 + time * 0.9) +
      Math.sin((r + c) * 0.045 + time * 0.5);
    return UNIVERSE_PALETTE[clampIndex(((v / 6 + 0.5) * PALETTE_N) | 0, PALETTE_N)] ?? '#000';
  }
  function recolorField() {
    for (const [el, pos] of liveCells) el.style.background = fieldColor(pos.r, pos.c);
  }

  function teardown() {
    if (grid) grid.destroy();
    grid = null;
    liveCells.clear();
    container.innerHTML = '';
  }

  function buildFieldGrid() {
    teardown();
    container.classList.remove('is-data');
    const g = makeSimpleGrid(
      fieldRows,
      FIELD_COLS,
      [FIELD_CELL],
      [FIELD_CELL],
      0,
      0,
      undefined,
      0,
      0,
      {
        snapToCell: false,
        allowEdit: false,
      },
    );
    const builder = g.colModel.createBuilder(
      () => {
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0';
        return el;
      },
      (el, ctx) => {
        if (el) {
          liveCells.set(el, { r: ctx.virtualRow, c: ctx.virtualCol });
          el.style.background = fieldColor(ctx.virtualRow, ctx.virtualCol);
        }
        return el;
      },
    );
    for (let c = 0; c < g.colModel.length(); c++) g.colModel.get(c).builder = builder;
    g.build(container);
    container.style.touchAction = 'none'; // full-screen demo owns the gesture
    grid = g;
    layout = 'field';
    total = fieldRows * FIELD_COLS;
  }

  function buildDataGrid() {
    teardown();
    container.classList.add('is-data');
    const widths = DATA_COLS.map((c) => c.width);
    const g = makeSimpleGrid(
      DATA_ROWS,
      DATA_COLS.length,
      [DATA_ROW_H],
      widths,
      1,
      0,
      undefined,
      1,
      0,
      {
        snapToCell: false,
        allowEdit: false,
      },
    );
    const cellBuilder = g.colModel.createBuilder(
      () => {
        const el = document.createElement('div');
        el.className = 'dcell';
        return el;
      },
      (el, ctx) => {
        if (!el) return el;
        const dataRow = ctx.virtualRow - 1; // row 0 is the header
        // Use the descriptor's stable data column, not the view position, so the
        // data follows the column when the user drags to reorder.
        const col = g.colModel.get(ctx.virtualCol).dataCol;
        const spec = DATA_COLS[col];
        el.textContent = cellText(dataRow, col);
        el.style.textAlign = spec?.align ?? 'left';
        el.classList.toggle('odd', dataRow % 2 === 1);
        el.style.color = col === 3 ? (STATUS_COLOR[cellText(dataRow, 3)] ?? '') : '';
        liveCells.set(el, { r: ctx.virtualRow, c: ctx.virtualCol });
        return el;
      },
    );
    for (let c = 0; c < g.colModel.length(); c++) g.colModel.get(c).builder = cellBuilder;

    const headerRow = g.rowModel.get(0);
    // Let the library's reorder/resize handlers receive header drags instead of
    // our custom header element swallowing them (enables drag-to-reorder columns).
    headerRow.isBuiltActionable = false;
    headerRow.builder = g.rowModel.createBuilder(
      () => {
        const el = document.createElement('div');
        el.className = 'dhead';
        return el;
      },
      (el, ctx) => {
        if (el) {
          const spec = DATA_COLS[g.colModel.get(ctx.virtualCol).dataCol];
          el.textContent = spec?.label ?? '';
          el.style.textAlign = spec?.align ?? 'left';
        }
        return el;
      },
      true,
    );

    g.build(container);

    container.style.touchAction = 'none'; // full-screen demo owns the gesture
    grid = g;
    layout = 'data';
    total = DATA_ROWS * DATA_COLS.length;
  }

  function ensureLayout(next: GridMode) {
    const want = layoutFor(next);
    if (want !== layout) {
      if (want === 'data') buildDataGrid();
      else buildFieldGrid();
    }
  }

  ensureLayout(mode);
  if (mode === 'life') {
    seedLife(getPattern());
    recolorField();
  }

  // Touch scrolling (drag + flick momentum, edge handoff, tap-vs-scroll slop)
  // is handled by the library now: grid.build() binds modules/touch.

  // --- animation loop ---
  let raf = 0;
  let last = 0;
  let fps = 0;
  let frames = 0;
  let acc = 0;

  function frame(ts: number) {
    const dt = last ? ts - last : 16;
    last = ts;
    acc += dt;
    frames++;
    if (acc >= 250) {
      fps = Math.round((frames * 1000) / acc);
      acc = 0;
      frames = 0;
    }

    const next = getMode();
    const changedMode = next !== mode;
    ensureLayout(next);
    mode = next;

    if (layout === 'field') {
      const size = getFieldRows();
      if (size !== fieldRows) {
        fieldRows = size;
        buildFieldGrid();
      }
    }

    // theme flip: recolor the field immediately (data grid recolors via CSS)
    const dark = currentIsDark();
    if (dark !== isDark) {
      isDark = dark;
      if (layout === 'field') recolorField();
    }

    if (mode === 'life') {
      const pattern = getPattern();
      const nonce = getResetNonce();
      let seeded = false;
      if (changedMode || pattern !== lastPattern || nonce !== lastResetNonce) {
        lastPattern = pattern;
        lastResetNonce = nonce;
        seedLife(pattern);
        seeded = true;
      }
      lifeAccMs += dt;
      let stepped = false;
      if (lifeAccMs >= LIFE_STEP_MS) {
        lifeAccMs = 0;
        stepLife();
        stepped = true;
      }
      if (seeded || stepped) recolorField();
      painted = liveCells.size;
    } else if (mode === 'universe') {
      time += dt * 0.0012;
      uniTick ^= 1;
      if (uniTick === 0) recolorField(); // ~30fps recolor is plenty for slow plasma
      painted = liveCells.size;
    } else {
      painted = liveCells.size; // data grid is static; the grid repaints on scroll
    }

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    stats: () => ({ fps, visible: painted, total, mode }),
    destroy: () => {
      cancelAnimationFrame(raf);
      teardown();
    },
  };
}

// Gosper glider gun, relative [row, col] cells.
function gosperGun(): number[][] {
  return [
    [5, 1],
    [5, 2],
    [6, 1],
    [6, 2],
    [3, 13],
    [3, 14],
    [4, 12],
    [4, 16],
    [5, 11],
    [5, 17],
    [6, 11],
    [6, 15],
    [6, 17],
    [6, 18],
    [7, 11],
    [7, 17],
    [8, 12],
    [8, 16],
    [9, 13],
    [9, 14],
    [1, 25],
    [2, 23],
    [2, 25],
    [3, 21],
    [3, 22],
    [4, 21],
    [4, 22],
    [5, 21],
    [5, 22],
    [6, 23],
    [6, 25],
    [7, 25],
    [3, 35],
    [3, 36],
    [4, 35],
    [4, 36],
  ];
}

// One period-3 pulsar (13x13), relative [row, col] cells.
function pulsarCells(): number[][] {
  const base = [2, 3, 4, 8, 9, 10];
  const cells: number[][] = [];
  for (const c of base) {
    cells.push([0, c], [5, c], [7, c], [12, c]);
    cells.push([c, 0], [c, 5], [c, 7], [c, 12]);
  }
  return cells;
}
