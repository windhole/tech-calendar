import { Event } from '@/types';

export async function loadEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}events.jsonl`);
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines.map((line) => JSON.parse(line));
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
}
