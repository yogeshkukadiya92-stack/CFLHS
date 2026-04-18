import { format } from 'date-fns';

export type HabitDayStatus = 'done' | 'skipped' | 'none';

const SKIP_PREFIX = 'skip:';
const DONE_PREFIX = 'done:';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDateKey = (raw: string) => {
  const trimmed = raw.trim();
  const key = trimmed.slice(0, 10);
  return DATE_RE.test(key) ? key : '';
};

type ParsedStatus = { dateKey: string; status: Exclude<HabitDayStatus, 'none'> } | null;

const parseEntry = (entry: string | Date): ParsedStatus => {
  if (entry instanceof Date) {
    return { dateKey: format(entry, 'yyyy-MM-dd'), status: 'done' };
  }
  const value = String(entry || '').trim();
  if (!value) return null;
  if (value.startsWith(SKIP_PREFIX)) {
    const dateKey = normalizeDateKey(value.slice(SKIP_PREFIX.length));
    return dateKey ? { dateKey, status: 'skipped' } : null;
  }
  if (value.startsWith(DONE_PREFIX)) {
    const dateKey = normalizeDateKey(value.slice(DONE_PREFIX.length));
    return dateKey ? { dateKey, status: 'done' } : null;
  }
  const legacyDate = normalizeDateKey(value);
  return legacyDate ? { dateKey: legacyDate, status: 'done' } : null;
};

export const getHabitStatusMap = (checkIns: Array<string | Date>) => {
  const map = new Map<string, Exclude<HabitDayStatus, 'none'>>();
  checkIns.forEach((entry) => {
    const parsed = parseEntry(entry);
    if (!parsed) return;
    map.set(parsed.dateKey, parsed.status);
  });
  return map;
};

export const getHabitDayStatus = (checkIns: Array<string | Date>, dateKey: string): HabitDayStatus => {
  const map = getHabitStatusMap(checkIns);
  return map.get(dateKey) || 'none';
};

export const getHabitDoneSet = (checkIns: Array<string | Date>) => {
  const set = new Set<string>();
  getHabitStatusMap(checkIns).forEach((status, dateKey) => {
    if (status === 'done') set.add(dateKey);
  });
  return set;
};

export const getHabitSkippedSet = (checkIns: Array<string | Date>) => {
  const set = new Set<string>();
  getHabitStatusMap(checkIns).forEach((status, dateKey) => {
    if (status === 'skipped') set.add(dateKey);
  });
  return set;
};

export const upsertHabitDayStatus = (checkIns: Array<string | Date>, dateKey: string, status: HabitDayStatus) => {
  const map = getHabitStatusMap(checkIns);
  if (status === 'none') {
    map.delete(dateKey);
  } else {
    map.set(dateKey, status);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayStatus]) => (dayStatus === 'done' ? day : `${SKIP_PREFIX}${day}`));
};
