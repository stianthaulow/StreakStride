export function calculateStreaks(dateArray: Date[], currentDate = new Date()) {
  currentDate.setUTCHours(0, 0, 0, 0);
  let currentStreak = 0;
  let lastStreak = 0;
  let longestStreak = 0;
  let foundCurrentStreak = false;
  let currentStreakStart = currentDate;
  let lastStreakEnd = currentDate;
  let longestStreakStart = currentDate;
  let longestStreakEnd = currentDate;
  for (let i = 0; i < dateArray.length; i++) {
    const checkDate = dateArray[i];

    if (!(checkDate instanceof Date)) {
      throw new Error("Invalid date");
    }

    checkDate.setUTCHours(0, 0, 0, 0);
    lastStreakEnd = dateArray[i - lastStreak]!;

    const timeDiff = currentDate.getTime() - checkDate.getTime();
    const diffInDays = timeDiff / (1000 * 60 * 60 * 24);

    if (diffInDays > 1) {
      foundCurrentStreak = true;
      lastStreak = 1;
    } else {
      lastStreak++;

      if (!foundCurrentStreak) {
        currentStreak++;
        currentStreakStart = checkDate;
      }

      if (lastStreak >= longestStreak) {
        longestStreak = lastStreak;
        longestStreakStart = checkDate;
        longestStreakEnd = lastStreakEnd;
      }
    }

    currentDate = checkDate;
  }

  return {
    currentStreak,
    currentStreakStart,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
  };
}

export function calculateStreak(dateArray: Date[], currentDate = new Date()) {
  currentDate.setUTCHours(0, 0, 0, 0);
  let count = 0;
  for (let i = 0; i < dateArray.length; i++) {
    const checkDate = dateArray[i];

    if (!(checkDate instanceof Date)) {
      throw new Error("Invalid date");
    }

    checkDate.setUTCHours(0, 0, 0, 0);

    const timeDiff = currentDate.getTime() - checkDate.getTime();
    const diffInDays = timeDiff / (1000 * 60 * 60 * 24);

    if (diffInDays > 1) {
      break;
    }
    count++;

    currentDate = checkDate;
  }

  return { streakCount: count, streakStart: currentDate };
}
