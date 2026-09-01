import { load } from 'js-yaml';
import holidaysYaml from '../../data/holidays.yaml?raw';
import type { Holiday } from './types';

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return null;
}

function isHolidayRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function loadHolidays(): Holiday[] {
  const parsed = load(holidaysYaml);

  if (!Array.isArray(parsed)) {
    console.error('holidays.yaml はリストである必要があります');
    return [];
  }

  const holidays: Holiday[] = [];

  for (const item of parsed) {
    if (!isHolidayRecord(item) || typeof item.name !== 'string') {
      continue;
    }

    const date = toIsoDate(item.date);
    if (!date) {
      continue;
    }

    holidays.push({ date, name: item.name });
  }

  return holidays;
}
