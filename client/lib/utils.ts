import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return format(date, 'h:mm a');
}

export function formatSidebarDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
