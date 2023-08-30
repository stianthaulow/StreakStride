import { expect, test } from "vitest";

import { calculateStreak, calculateStreaks } from "~/utils/streak";

test("calculateStreaks function", () => {
  const dates = [
    new Date("2023-08-15"),
    new Date("2023-08-14"),
    new Date("2023-08-13"),
    new Date("2023-08-12"),
    new Date("2023-08-11"),
    new Date("2023-08-08"),
    new Date("2023-08-06"),
  ];

  const tomorrow = calculateStreaks(dates, new Date("2023-08-16"));
  const today = calculateStreaks(dates, new Date("2023-08-15"));
  const dayAfterTomorrow = calculateStreaks(dates, new Date("2023-08-17"));

  expect(tomorrow.currentStreak).toBe(5);
  expect(today.currentStreak).toBe(5);
  expect(dayAfterTomorrow.currentStreak).toBe(0);

  expect(tomorrow.longestStreak).toBe(5);
  expect(today.longestStreak).toBe(5);
  expect(dayAfterTomorrow.longestStreak).toBe(5);

  expect(tomorrow.currentStreakStart).toEqual(new Date("2023-08-11"));
  expect(today.currentStreakStart).toEqual(new Date("2023-08-11"));
  expect(dayAfterTomorrow.currentStreakStart).toEqual(new Date("2023-08-17"));

  expect(tomorrow.longestStreakStart).toEqual(new Date("2023-08-11"));
  expect(today.longestStreakStart).toEqual(new Date("2023-08-11"));
  expect(dayAfterTomorrow.longestStreakStart).toEqual(new Date("2023-08-11"));

  expect(tomorrow.longestStreakEnd).toEqual(new Date("2023-08-15"));
  expect(today.longestStreakEnd).toEqual(new Date("2023-08-15"));
  expect(dayAfterTomorrow.longestStreakEnd).toEqual(new Date("2023-08-15"));
});

test("calculateStreaks function", () => {
  const dates = [
    new Date("2023-08-15"),
    new Date("2023-08-13"),
    new Date("2023-08-12"),
    new Date("2023-08-11"),
    new Date("2023-08-08"),
    new Date("2023-08-06"),
  ];

  expect(calculateStreaks(dates, new Date("2023-08-17")).currentStreak).toBe(0);
  expect(calculateStreaks(dates, new Date("2023-08-16")).currentStreak).toBe(1);
  expect(calculateStreaks(dates, new Date("2023-08-15")).currentStreak).toBe(1);
});

test("calculateStreaks function", () => {
  const dates = [
    new Date("13 Jan 2023 02:12:00 GMT"),
    new Date("12 Jan 2023 23:59:00 GMT"),
    new Date("11 Jan 2023 01:00:00 GMT"),
    new Date("04 Jan 2023 00:00:01 GMT"),
    new Date("01 Jan 2023 02:00:00 GMT"),
  ];

  expect(calculateStreaks(dates, new Date("2023-01-13")).currentStreak).toBe(3);
  expect(calculateStreaks(dates, new Date("2023-01-14")).currentStreak).toBe(3);
  expect(calculateStreaks(dates, new Date("2023-01-15")).currentStreak).toBe(0);
});

test("calculateStreaks function", () => {
  const dates = [
    new Date("2023-08-15"),
    new Date("2023-08-13"),
    new Date("2023-08-12"),
    new Date("2023-08-11"),
    new Date("2023-08-08"),
    new Date("2023-08-06"),
    new Date("2023-08-05"),
    new Date("2023-08-04"),
    new Date("2023-08-02"),
    new Date("2023-08-01"),
    new Date("2023-07-20"),
    new Date("2023-07-19"),
    new Date("2023-07-18"),
    new Date("2023-07-17"),
    new Date("2023-07-16"),
    new Date("2023-07-15"),
    new Date("2023-07-14"),
    new Date("2023-07-10"),
    new Date("2023-07-09"),
  ];

  expect(calculateStreaks(dates, new Date("2023-08-16")).longestStreak).toBe(7);
  expect(calculateStreaks(dates, new Date("2023-08-15")).longestStreak).toBe(7);
  expect(calculateStreaks(dates, new Date("2023-01-17")).longestStreak).toBe(7);
});

test("calculateStreaks function", () => {
  const dates = [
    new Date("2023-08-15"),
    new Date("2023-08-13"),
    new Date("2023-08-12"),
    new Date("2023-08-11"),
    new Date("2023-08-08"),
    new Date("2023-08-06"),
    new Date("2023-08-05"),
    new Date("2023-08-04"),
    new Date("2023-08-02"),
    new Date("2023-08-01"),
    new Date("2023-07-20"),
    new Date("2023-07-19"),
    new Date("2023-07-18"),
    new Date("2023-07-17"),
    new Date("2023-07-16"),
    new Date("2023-07-15"),
    new Date("2023-07-14"),
  ];

  expect(calculateStreaks(dates, new Date("2023-08-16")).longestStreak).toBe(7);
  expect(calculateStreaks(dates, new Date("2023-08-15")).longestStreak).toBe(7);
  expect(calculateStreaks(dates, new Date("2023-01-17")).longestStreak).toBe(7);
});

test("calculateStreaks function", () => {
  const dates = [
    new Date("2023-07-20"),
    new Date("2023-07-19"),
    new Date("2023-07-18"),
    new Date("2023-07-17"),
    new Date("2023-07-16"),
    new Date("2023-07-15"),
    new Date("2023-07-14"),
  ];

  expect(calculateStreaks(dates, new Date("2023-08-16")).longestStreak).toBe(7);
  expect(calculateStreaks(dates, new Date("2023-08-15")).longestStreak).toBe(7);
  expect(calculateStreaks(dates, new Date("2023-01-17")).longestStreak).toBe(7);
});

test("calculateStreak function", () => {
  const dates = [
    new Date("2023-08-15"),
    new Date("2023-08-14"),
    new Date("2023-08-13"),
    new Date("2023-08-12"),
    new Date("2023-08-11"),
    new Date("2023-08-08"),
    new Date("2023-08-06"),
  ];

  const tomorrow = calculateStreak(dates, new Date("2023-08-16"));
  const today = calculateStreak(dates, new Date("2023-08-15"));
  const dayAfterTomorrow = calculateStreak(dates, new Date("2023-08-17"));

  expect(tomorrow.streakCount).toBe(5);
  expect(today.streakCount).toBe(5);
  expect(dayAfterTomorrow.streakCount).toBe(0);

  expect(tomorrow.streakStart).toEqual(new Date("2023-08-11"));
  expect(today.streakStart).toEqual(new Date("2023-08-11"));
  expect(dayAfterTomorrow.streakStart).toEqual(new Date("2023-08-17"));
});
