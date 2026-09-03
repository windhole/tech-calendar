import { load } from 'js-yaml';
import type { Holiday } from './types';
import {
  fetchPublicYaml,
  type LoadYamlOptions,
} from '@/utils/yamlFetch';

const holidayCache = new Map<number, Holiday[]>();

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

function parseHolidayYaml(text: string): Holiday[] {
  const parsed = load(text);

  if (!Array.isArray(parsed)) {
    console.error('祝日 YAML はリストである必要があります');
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

export function yearsCoveredByRange(startIso: string, endIso: string): number[] {
  const startYear = Number(startIso.slice(0, 4));
  const endYear = Number(endIso.slice(0, 4));
  const years: number[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }

  return years;
}

export function clearHolidayCache(): void {
  holidayCache.clear();
}

export async function loadHolidaysForYear(
  year: number,
  options: LoadYamlOptions = {}
): Promise<Holiday[]> {
  if (!options.bypassCache) {
    const cached = holidayCache.get(year);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await fetchPublicYaml(`holidays/${year}.yaml`, options);
    if (!response.ok) {
      holidayCache.set(year, []);
      return [];
    }

    const holidays = parseHolidayYaml(await response.text());
    holidayCache.set(year, holidays);
    return holidays;
  } catch (error) {
    console.error(`Failed to load holidays for ${year}:`, error);
    holidayCache.set(year, []);
    return [];
  }
}

export async function loadHolidaysForYears(
  years: number[],
  options: LoadYamlOptions = {}
): Promise<Holiday[]> {
  const uniqueYears = [...new Set(years)];
  const lists = await Promise.all(
    uniqueYears.map((year) => loadHolidaysForYear(year, options))
  );
  return lists.flat();
}
