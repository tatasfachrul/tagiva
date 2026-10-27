import { describe, it, expect } from 'vitest';
import {
  formatDateWib,
  getDaysUntilDateWib,
  getTodayWibString,
  getYearAndMonthWib,
  isPastDueWib,
} from '../timezone';

describe('Asia/Jakarta WIB Timezone Engine (NFR-5)', () => {
  it('extracts year and 2-digit month correctly in WIB', () => {
    const res = getYearAndMonthWib('2026-10-27');
    expect(res.year).toBe(2026);
    expect(res.month).toBe('10');

    const resJan = getYearAndMonthWib('2027-01-05');
    expect(resJan.year).toBe(2027);
    expect(resJan.month).toBe('01');
  });

  it('evaluates overdue status relative to reference WIB date', () => {
    const today = '2026-10-27';

    // Due yesterday -> overdue
    expect(isPastDueWib('2026-10-26', today)).toBe(true);

    // Due today -> not overdue
    expect(isPastDueWib('2026-10-27', today)).toBe(false);

    // Due tomorrow -> not overdue
    expect(isPastDueWib('2026-10-28', today)).toBe(false);
  });

  it('calculates calendar days difference in WIB', () => {
    const today = '2026-10-27';
    expect(getDaysUntilDateWib('2026-11-26', today)).toBe(30);
    expect(getDaysUntilDateWib('2026-11-10', today)).toBe(14);
    expect(getDaysUntilDateWib('2026-10-30', today)).toBe(3);
    expect(getDaysUntilDateWib('2026-10-27', today)).toBe(0);
    expect(getDaysUntilDateWib('2026-10-25', today)).toBe(-2);
  });

  it('formats dates cleanly in EN and ID (DS-A04)', () => {
    const dateStr = '2026-10-27';
    expect(formatDateWib(dateStr, 'en')).toBe('27 Oct 2026');
    expect(formatDateWib(dateStr, 'id')).toBe('27 Okt 2026');
  });

  it('returns valid YYYY-MM-DD for today in WIB', () => {
    const today = getTodayWibString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
