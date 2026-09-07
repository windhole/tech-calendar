export const EVENT_REGIONS = [
  'オンライン',
  '北海道',
  '東北',
  '関東',
  '東京',
  '甲信越',
  '中部',
  '北陸',
  '関西',
  '中国',
  '四国',
  '九州',
  '沖縄',
] as const;

export type EventRegion = (typeof EVENT_REGIONS)[number];

export interface Event {
  startDate: string;
  endDate: string;
  eventName: string;
  location: string;
  url: string;
  region: EventRegion | null;
}

export interface Holiday {
  date: string;
  name: string;
}
