/**
 * Asia/Jakarta (WIB, UTC+07:00) Timezone Engine (NFR-5, DS-A04)
 *
 * All business dates, invoice issue/due boundaries, annual resets,
 * and reminder schedules must be evaluated in Asia/Jakarta.
 */

export const WIB_TIMEZONE = 'Asia/Jakarta';

/**
 * Returns today's calendar date string in Asia/Jakarta (YYYY-MM-DD).
 */
export function getTodayWibString(referenceDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: WIB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(referenceDate); // en-CA outputs YYYY-MM-DD
}

/**
 * Extracts year and 2-digit month (01-12) in Asia/Jakarta from a date string (YYYY-MM-DD) or Date object.
 */
export function getYearAndMonthWib(
  dateInput: string | Date,
): { year: number; month: string } {
  const date = typeof dateInput === 'string' ? new Date(`${dateInput}T12:00:00+07:00`) : dateInput;

  const yearFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: WIB_TIMEZONE,
    year: 'numeric',
  });

  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: WIB_TIMEZONE,
    month: '2-digit',
  });

  const year = parseInt(yearFormatter.format(date), 10);
  const month = monthFormatter.format(date);

  return { year, month };
}

/**
 * Checks whether an invoice's due date is in the past relative to today in WIB.
 */
export function isPastDueWib(dueDateString: string, referenceDateString?: string): boolean {
  const todayStr = referenceDateString ?? getTodayWibString();
  return dueDateString < todayStr;
}

/**
 * Calculates calendar days remaining until targetDateString relative to today in WIB.
 * Returns negative if targetDate has passed.
 */
export function getDaysUntilDateWib(targetDateString: string, fromDateString?: string): number {
  const fromStr = fromDateString ?? getTodayWibString();
  const d1 = new Date(`${fromStr}T00:00:00+07:00`).getTime();
  const d2 = new Date(`${targetDateString}T00:00:00+07:00`).getTime();
  const diffMs = d2 - d1;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a YYYY-MM-DD date string or Date into DD MMM YYYY (e.g. 27 Oct 2026 or 27 Okt 2026).
 * Follows DS-A04 to avoid MM/DD vs DD/MM ambiguity.
 */
export function formatDateWib(dateInput: string | Date, locale: 'en' | 'id' = 'en'): string {
  const date = typeof dateInput === 'string' ? new Date(`${dateInput}T12:00:00+07:00`) : dateInput;

  const intlLocale = locale === 'id' ? 'id-ID' : 'en-GB';

  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: WIB_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
