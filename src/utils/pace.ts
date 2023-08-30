export const validTimePattern =
  "^(?:[0-9]?[0-9]?[0-9]:)?(?:[0-9]?[0-9]:)?(?:[0-9]?[0-9])?(?:.?[0-9]?[0-9]?[0-9])$";
export const validSpeedPattern = "^(?:[0-9]?[0-9]?[0-9].)?(?:[0-9]?[0-9])$";

const validTimeRegExp = new RegExp(validTimePattern);
const validSpeedRegExp = new RegExp(validSpeedPattern);

export const isValidTime = (input: string) => validTimeRegExp.test(input);
export const isValidSpeed = (input: string) => validSpeedRegExp.test(input);

export function parsePace(duration: string, distanceMeters = 1000) {
  const [secondsPart, msPart] = duration.split(".");
  const ms = msPart ? Number(msPart.padEnd(3, "0")) : 0;
  const parts = secondsPart!.split(":").map(Number);

  let [hours, minutes, seconds] = [0, 0, 0];

  if (parts.length === 1) {
    [seconds] = parts as [number];
  } else if (parts.length === 2) {
    [minutes, seconds] = parts as [number, number];
  } else if (parts.length === 3) {
    [hours, minutes, seconds] = parts as [number, number, number];
  }

  return (
    (ms + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000) /
    distanceMeters
  );
}

export const parsePaceForDistance = (distance: number) => (duration: string) =>
  parsePace(duration, distance);

export function formatPace(
  milliseconds: number,
  distance = 1000,
  showMs = false,
): string {
  const hours = Math.floor((milliseconds * distance) / (60 * 60 * 1000));
  const minutes = Math.floor(
    ((milliseconds * distance) % (60 * 60 * 1000)) / (60 * 1000),
  );
  const seconds = Math.floor(((milliseconds * distance) % (60 * 1000)) / 1000);
  const ms = (milliseconds * distance) % 1000;

  const formattedHours = hours > 0 ? hours.toString() + ":" : "";
  const formattedMinutes =
    minutes > 0 ? `${minutes < 10 && hours > 0 ? "0" : ""}${minutes}:` : "";
  const formattedSeconds =
    seconds > 0
      ? `${seconds < 10 && minutes > 0 ? "0" : ""}${seconds}`
      : minutes > 0
      ? "00"
      : "0";

  const formattedMs = showMs
    ? `.${Math.floor(ms).toString().padStart(3, "0")}`
    : "";

  return `${formattedHours}${formattedMinutes}${formattedSeconds}${formattedMs}`;
}

export const formatPaceForDistance =
  (distance: number, showMs = false) =>
  (milliseconds: number) =>
    formatPace(milliseconds, distance, showMs);
