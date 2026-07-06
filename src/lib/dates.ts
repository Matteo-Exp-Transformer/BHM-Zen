/**
 * Date locali Italia — RULE timezone (Bussola §2): MAI toISOString().split('T')
 * per una data locale. Qui vivono le uniche funzioni di data usate dalla UI.
 */

/** Chiave giorno locale YYYY-MM-DD (per raggruppare/confrontare per giorno). */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const g = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${g}`
}

export function startOfDayLocal(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function endOfDayLocal(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/** «martedì 5 luglio» → «Martedì 5 luglio» (header di Oggi, mockup 01). */
export function formatDayLong(d: Date = new Date()): string {
  const s = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** «17:42» — orario breve per chip e note. */
export function formatTimeShort(d: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Periodo coperto da un completamento in base alla frequenza della mansione
 * (♻️ port da useGenericTasks legacy): il completamento vale per il SUO periodo,
 * anche se fatto in anticipo rispetto a next_due.
 */
export function periodForFrequency(
  frequency: string,
  reference: Date,
): { start: Date; end: Date } {
  switch (frequency) {
    case 'weekly': {
      // lunedì–domenica della settimana di riferimento
      const dayOfWeek = reference.getDay() || 7 // 0=domenica → 7
      const monday = new Date(reference)
      monday.setDate(reference.getDate() - (dayOfWeek - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { start: startOfDayLocal(monday), end: endOfDayLocal(sunday) }
    }
    case 'monthly': {
      const start = new Date(reference.getFullYear(), reference.getMonth(), 1)
      const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)
      return { start: startOfDayLocal(start), end: endOfDayLocal(end) }
    }
    case 'annually':
    case 'annual': {
      const start = new Date(reference.getFullYear(), 0, 1)
      const end = new Date(reference.getFullYear(), 11, 31)
      return { start: startOfDayLocal(start), end: endOfDayLocal(end) }
    }
    // daily, custom, as_needed e ogni altra frequenza: vale per il giorno
    default:
      return { start: startOfDayLocal(reference), end: endOfDayLocal(reference) }
  }
}
