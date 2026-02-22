export const detectUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getTimezoneOffset = (timezone: string): number => {
  const now = new Date();
  const utcDate = new Date(
    now.toLocaleString('en-US', { timeZone: 'UTC' })
  );
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
};

export const convertUTCToTimezone = (
  utcTime: number,
  timezone: string
): Date => {
  const utcDate = new Date(utcTime);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const dateObj: Record<string, string> = {};
  parts.forEach((part) => {
    dateObj[part.type] = part.value;
  });

  return new Date(
    `${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}`
  );
};

export const isPassedMidnight = (
  createdAt: number,
  currentUtcTime: number,
  timezone: string
): boolean => {
  const createdDate = convertUTCToTimezone(createdAt, timezone);
  const currentDate = convertUTCToTimezone(currentUtcTime, timezone);

  return (
    createdDate.getDate() !== currentDate.getDate() ||
    createdDate.getMonth() !== currentDate.getMonth() ||
    createdDate.getFullYear() !== currentDate.getFullYear()
  );
};

export const getDayStartUTC = (
  targetDate: Date,
  timezone: string
): number => {
  // Get the start of day in the user's timezone, then convert back to UTC
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(targetDate);
  const dateObj: Record<string, string> = {};
  parts.forEach((part) => {
    dateObj[part.type] = part.value;
  });

  const localDateString = `${dateObj.year}-${dateObj.month}-${dateObj.day}T00:00:00`;
  const localDate = new Date(localDateString);

  // Calculate offset
  const utcDate = new Date(
    localDate.toLocaleString('en-US', { timeZone: 'UTC' })
  );
  const tzDate = new Date(
    localDate.toLocaleString('en-US', { timeZone: timezone })
  );
  const offset = tzDate.getTime() - utcDate.getTime();

  return localDate.getTime() - offset;
};

export const formatDateByTimezone = (
  timestamp: number,
  timezone: string,
  format: string = 'short'
): string => {
  const date = new Date(timestamp);
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
    }).format(date);
  } else if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } else if (format === 'time') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }
  
  return date.toString();
};
