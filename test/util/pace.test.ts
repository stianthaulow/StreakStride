import { describe, expect, test } from "vitest";

import { formatPace, parsePace } from "~/utils/pace";

const pacePairs = [
  { distance: 1000, duration: "4:30.000", ms: 270 },
  { distance: 1000, duration: "4:30.500", ms: 270.5 },
  { distance: 1000, duration: "30.500", ms: 30.5 },
  { distance: 1000, duration: "15:15.250", ms: 915.25 },
  { distance: 1000, duration: "15:15.000", ms: 915 },
];

const formats = [
  { distance: 1000, duration: "4:30", expected: 270 },
  { distance: 1000, duration: "04:30", expected: 270 },
  { distance: 1000, duration: "4:30.0", expected: 270 },
  { distance: 1000, duration: "4:30.00", expected: 270 },
  { distance: 1000, duration: "4:30.000", expected: 270 },
  { distance: 1000, duration: "4:30.500", expected: 270.5 },
  { distance: 1000, duration: "4:30.50", expected: 270.5 },
  { distance: 1000, duration: "4:30.5", expected: 270.5 },
  { distance: 1000, duration: "00:04:30.05", expected: 270.05 },
  { distance: 10_000, duration: "00:04:30.5", expected: 27.05 },
  { distance: 10_000, duration: "01:04:30.5", expected: 387.05 },
  { distance: 100, duration: "9.75", expected: 97.5 },
  { distance: 100, duration: "0.5", expected: 5 },
];

const paces = [
  { distance: 1000, ms: 270, showMs: false, expected: "4:30" },
  { distance: 1000, ms: 270, showMs: true, expected: "4:30.000" },
  { distance: 1000, ms: 270.5, showMs: true, expected: "4:30.500" },
  { distance: 1000, ms: 270.5, showMs: false, expected: "4:30" },
  { distance: 10_000, ms: 27.05, showMs: true, expected: "4:30.500" },
  { distance: 10_000, ms: 387.05, showMs: true, expected: "1:04:30.500" },
  { distance: 10_000, ms: 387.05, showMs: false, expected: "1:04:30" },
  { distance: 100, ms: 97.5, showMs: true, expected: "9.750" },
  { distance: 100, ms: 5, showMs: true, expected: "0.500" },
];

describe.each(pacePairs)(
  "Test Duration: $duration, ms: $ms, Distance: $distance), showing milliseconds",
  ({ distance, duration, ms }) => {
    test(`parsePace(${duration}, ${distance})`, () => {
      expect(parsePace(duration, distance)).toBe(ms);
    });

    test(`formatPace(${ms}, ${distance})`, () => {
      expect(formatPace(ms, distance, true)).toBe(duration);
    });
  },
);

describe.each(formats)(
  "Test parsing format: $duration",
  ({ distance, duration, expected }) => {
    test(`parsePace(${duration}, ${distance})`, () => {
      expect(parsePace(duration, distance)).toBe(expected);
    });
  },
);

describe.each(paces)(
  "Test formatting pace: $ms",
  ({ distance, ms, expected, showMs }) => {
    test(`formatPace(${ms}, ${distance}, ${showMs})`, () => {
      expect(formatPace(ms, distance, showMs)).toBe(expected);
    });
  },
);
