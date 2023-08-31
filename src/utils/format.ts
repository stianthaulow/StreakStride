import { format, formatDuration, intervalToDuration } from "date-fns";

export function formatTime(timeInSeconds: number) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
  const seconds = timeInSeconds - hours * 3600 - minutes * 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatDistance(distanceInMeters: number) {
  if (distanceInMeters < 1000) {
    return `${distanceInMeters}m`;
  }

  const km = Math.round((distanceInMeters / 1000) * 100) / 100;

  if (km % 1 === 0) {
    return `${km}k`;
  }

  return `${km.toFixed(2)}k`;
}

export function formatMovingTime(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return formatDuration(duration, {
    format: ["years", "months", "days", "hours", "minutes"],
  });
}

export function formatActivityDate(date: Date) {
  return format(date, "EEEE yyyy-MM-dd HH:mm");
}

export const pluralize = (num: number, word: string, plural = word + "s") =>
  [1, -1].includes(Number(num)) ? word : plural;
