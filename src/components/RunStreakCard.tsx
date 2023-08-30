import { CalendarRange } from "lucide-react";

import { cn } from "~/utils/cn";
import { pluralize } from "~/utils/format";
import { Progress } from "~/components/ui/progress";
import styles from "~/styles/shake.module.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type RunStreakCardProps = {
  streakCount: number;
  streakStart: Date;
  ranToday: boolean;
};

export const RunStreakCard = ({
  streakCount,
  streakStart,
  ranToday,
}: RunStreakCardProps) => {
  const streakPercent = (streakCount / 365) * 100;

  console.log(streakPercent);

  const streakDays = `${streakCount} ${pluralize(streakCount, "day")}`;
  const since = streakStart.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="max-w-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <CalendarRange />
          Run streak:{" "}
          <span className={cn(ranToday && styles.shake)}>{streakDays}</span>
        </CardTitle>
        <CardDescription>since {since}</CardDescription>
      </CardHeader>

      <CardContent>
        {streakPercent < 100 && (
          <>
            <Progress value={streakPercent} />
            <div className="w-full text-right text-sm text-slate-500 dark:text-slate-400">
              Full year progress
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
