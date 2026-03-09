import { describe, expect, it } from 'vitest';
import {
  formatCountdown,
  formatBirthYear,
  formatIdentityNumber,
  getAvailableGrades,
  getSessionById,
  getSessionWindowStatus,
  getSessionsForGrade,
} from './helpers';

describe('bursluluk helpers', () => {
  it('returns valid sessions per grade', () => {
    expect(getSessionsForGrade(3).map((item) => item.id)).toEqual(['oturum-2026-03-28-10-primary', 'oturum-2026-03-29-15-primary']);
    expect(getSessionsForGrade(10).map((item) => item.id)).toEqual(['oturum-2026-03-28-15-high', 'oturum-2026-03-29-10-high']);
    expect(getSessionsForGrade(1).map((item) => item.id)).toEqual(['oturum-2026-03-28-10-primary']);
  });

  it('sanitizes identity and birth year inputs', () => {
    expect(formatIdentityNumber('1234a56789012')).toBe('12345678901');
    expect(formatBirthYear('2014/abc')).toBe('2014');
  });

  it('exposes supported grades and sessions', () => {
    expect(getAvailableGrades()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(getSessionById('oturum-2026-03-28-13-middle')?.startsAt).toBe('13:00');
  });

  it('calculates window status and countdown labels', () => {
    expect(getSessionWindowStatus('2026-03-28T10:00:00.000Z', '2026-03-28T11:00:00.000Z', new Date('2026-03-28T09:30:00.000Z'))).toBe('waiting');
    expect(getSessionWindowStatus('2026-03-28T10:00:00.000Z', '2026-03-28T11:00:00.000Z', new Date('2026-03-28T10:30:00.000Z'))).toBe('open');
    expect(formatCountdown('2026-03-28T10:00:00.000Z', new Date('2026-03-28T09:00:00.000Z'))).toBe('01:00:00');
  });
});
