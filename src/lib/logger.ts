/* eslint-disable no-console */
/**
 * Logger di progetto (RULE Bussola §2: mai console.log diretto in produzione).
 * In beta: wrapper leggero con livello da env; qui si aggancia Sentry quando entra.
 */
type Level = 'debug' | 'info' | 'warn' | 'error'

const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const envLevel = (import.meta.env.VITE_LOG_LEVEL as Level | undefined) ?? 'info'
const threshold = order[envLevel] ?? order.info

function log(level: Level, ...args: unknown[]) {
  if (order[level] < threshold) return
  const fn = level === 'debug' ? console.debug : console[level]
  fn(`[bhm:${level}]`, ...args)
}

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
}
