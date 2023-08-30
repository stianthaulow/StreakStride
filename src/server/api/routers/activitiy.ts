import { isToday } from "~/utils/date";
import { calculateStreak } from "~/utils/streak";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { SportType } from "~/server/strava";

const oneMile = 1609.34;

export const activityRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const totalStats = await ctx.prisma.activity.aggregate({
      _count: true,
      _sum: {
        distance: true,
        movingTime: true,
        totalElevationGain: true,
      },
    });

    const list = await ctx.prisma.activity.findMany({
      orderBy: { date: "desc" },
    });

    const groups = await ctx.prisma.activity.groupBy({
      by: ["sportType"],
      _count: true,
      _sum: {
        distance: true,
        movingTime: true,
        totalElevationGain: true,
      },
    });

    const runs = await ctx.prisma.activity.aggregate({
      _count: true,
      _sum: {
        distance: true,
        movingTime: true,
        totalElevationGain: true,
      },
      where: {
        OR: [
          { sportType: "Run" },
          { sportType: "VirtualRun" },
          { sportType: "TrailRun" },
        ],
      },
    });

    const skis = await ctx.prisma.activity.aggregate({
      _count: true,
      _sum: {
        distance: true,
        movingTime: true,
        totalElevationGain: true,
      },
      where: {
        OR: [{ sportType: "NordicSki" }, { sportType: "BackcountrySki" }],
      },
    });

    const stats = groups.reduce(
      (acc, { sportType, _count, _sum }) => ({
        ...acc,
        [sportType]: {
          count: _count,
          distance: _sum.distance,
          movingTime: _sum.movingTime,
          totalElevationGain: _sum.totalElevationGain,
        },
      }),
      {},
    ) as Record<
      Partial<SportType>,
      {
        count: number;
        distance: number;
        movingTime: number;
        totalElevationGain: number;
      }
    >;

    return {
      list,
      totalStats: {
        count: totalStats._count,
        distance: totalStats._sum.distance,
        movingTime: totalStats._sum.movingTime,
      },
      stats,
      totalRunStats: {
        count: runs._count,
        distance: runs._sum.distance,
        movingTime: runs._sum.movingTime,
        totalElevationGain: runs._sum.totalElevationGain,
      },
      totalSkiStats: {
        count: skis._count,
        distance: skis._sum.distance,
        movingTime: skis._sum.movingTime,
        totalElevationGain: skis._sum.totalElevationGain,
      },
    };
  }),

  getLast: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.activity.findFirst({
      where: {
        OR: [
          { sportType: "Run" },
          { sportType: "VirtualRun" },
          { sportType: "TrailRun" },
        ],
      },
      orderBy: { date: "desc" },
    });
  }),

  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const activities = await ctx.prisma.activity.findMany({
      where: {
        AND: [
          { sportType: { in: ["Run", "VirtualRun", "TrailRun"] } },
          { distance: { gt: oneMile } },
        ],
      },
      orderBy: { date: "desc" },
      select: {
        date: true,
        distance: true,
        movingTime: true,
      },
    });

    const runDates = activities.map((activity) => activity.date);
    const [lastRunDate] = runDates;

    const streak = {
      ...calculateStreak(runDates),
      ranToday: !!lastRunDate && isToday(lastRunDate),
    };

    const [lastRun] = activities;

    return { streak, lastRun };
  }),
});
