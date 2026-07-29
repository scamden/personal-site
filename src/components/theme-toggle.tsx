import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

const CYCLE: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' };
const LABEL: Record<ThemeMode, string> = { light: '☀ Light', dark: '☾ Dark', system: '◐ System' };

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // storage unavailable — fall through to system.
  }
  return 'system';
}

// The applied mode, read from the DOM — the source of truth at click time,
// so cycling is correct even when clicks land faster than React re-renders.
function activeMode(): ThemeMode {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' || attr === 'light' ? attr : 'system';
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') {
    root.removeAttribute('data-theme'); // let prefers-color-scheme govern
  } else {
    root.setAttribute('data-theme', mode);
  }
  try {
    if (mode === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', mode);
  } catch {
    // storage unavailable — the choice just won't persist.
  }
}

/**
 * Cycles Light → Dark → System. "System" clears the override so the OS
 * preference governs. The no-flash script in __root sets the initial theme.
 */
export function ThemeToggle() {
  // undefined until mounted so server and first client render agree (no hydration mismatch).
  const [mode, setMode] = useState<ThemeMode | undefined>(undefined);

  useEffect(() => {
    setMode(readMode());
  }, []);

  const current = mode ?? 'system';

  const handleToggle = () => {
    const next = CYCLE[activeMode()];
    applyMode(next);
    setMode(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Theme: ${current}. Switch to ${CYCLE[current]}.`}
    >
      {LABEL[current]}
    </button>
  );
}
