import type { Config } from 'tailwindcss'

/**
 * Direzione UI §13 masterplan — «clinico-caldo».
 * Base neutra CALDA (avorio/grigio-sabbia), inchiostro quasi-nero caldo,
 * colore = verdetto (verde ok · ambra attento · rosso raro), accento terracotta.
 * Palette di partenza: si affina nelle sedute UI (mockup = verità visiva).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // base clinico-calda
        sand: {
          50: '#faf7f2',
          100: '#f3eee6',
          200: '#e7dfd2',
          300: '#d5c9b6',
        },
        ink: {
          DEFAULT: '#2b2622',
          soft: '#5c544c',
          mute: '#8a8178',
        },
        // accento di brand (terracotta / arancio bruciato) — con parsimonia
        terra: {
          500: '#c05f36',
          600: '#b8552f',
          700: '#9a4526',
        },
        // colore = verdetto, non decorazione
        verdict: {
          ok: '#3d8b5f',
          warn: '#d99a2b',
          alarm: '#c0392b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
