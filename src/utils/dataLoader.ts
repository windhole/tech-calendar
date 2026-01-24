import { Event, Holiday } from '@/types';

export async function loadEvents(): Promise<Event[]> {
  try {
    const response = await fetch('/events.jsonl');
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines.map((line) => JSON.parse(line));
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
}

export async function loadHolidays(): Promise<Holiday[]> {
  try {
    const response = await fetch('/holidays.jsonl');
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines.map((line) => JSON.parse(line));
  } catch (error) {
    console.error('Failed to load holidays:', error);
    return [];
  }
}
