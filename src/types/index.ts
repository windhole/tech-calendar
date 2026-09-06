export interface Event {
  startDate: string;
  endDate: string;
  eventName: string;
  location: string;
  url: string;
  tags: string[];
}

export interface Holiday {
  date: string;
  name: string;
}
