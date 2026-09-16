export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

export const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', options ?? {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function formatDateTimeWithWeekday(dateString: string): string {
  return formatDate(dateString, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatShortDate(dateString: string): string {
  return formatDate(dateString, { month: 'short', day: 'numeric' });
}

export function formatTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${formatTime(start)}–${formatTime(end)}`;
  }
  return `${formatShortDate(start)} ${formatTime(start)} – ${formatShortDate(end)} ${formatTime(end)}`;
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatShortDate(dateString);
}

export function formatDateFlag(dateString: string): { md: string; dow: string } {
  const date = new Date(dateString);
  return {
    md: `${MONTHS[date.getMonth()]} ${date.getDate()}`,
    dow: DOW[date.getDay()],
  };
}
