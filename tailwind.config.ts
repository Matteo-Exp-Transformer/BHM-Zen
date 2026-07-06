import type { Config } from 'tailwindcss'

/**
 * Direzione UI §13 — «clinico-caldo». I VALORI vivono nelle CSS variables di
 * src/index.css (token canonici dal mockup 06, light+dark): qui solo la mappa.
 * Colore = verdetto, non decorazione (ok/warn/bad); accento terracotta con parsimonia.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: { DEFAULT: 'var(--ground)', 2: 'var(--ground-2)' },
        surface: { DEFAULT: 'var(--surface)', 2: 'var(--surface-2)' },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-2)',
          mute: 'var(--ink-muted)',
        },
        hairline: { DEFAULT: 'var(--hairline)', 2: 'var(--hairline-2)' },
        accent: {
          DEFAULT: 'var(--accent)',
          ink: 'var(--accent-ink)',
          soft: 'var(--accent-soft)',
        },
        ok: { DEFAULT: 'var(--ok)', bg: 'var(--ok-bg)', ink: 'var(--ok-ink)' },
        warn: { DEFAULT: 'var(--warn)', bg: 'var(--warn-bg)', ink: 'var(--warn-ink)' },
        bad: { DEFAULT: 'var(--bad)', bg: 'var(--bad-bg)', ink: 'var(--bad-ink)' },
      },
      boxShadow: {
        card: 'var(--shadow)',
        lg2: 'var(--shadow-lg)',
      },
      borderRadius: {
        card: '18px',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.4, 0.01, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
