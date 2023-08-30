import { z } from "zod";

import {
  defaultDistances,
  defaultPace,
  distanceSchema,
  type Distance,
} from "~/pages/pace";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const paceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.session.user;
    const paceData = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        initialPace: true,
        paceDistances: true,
      },
    });

    const pace = paceData?.initialPace || defaultPace;
    const distances = z.array(distanceSchema).safeParse(paceData?.paceDistances)
      .success
      ? (paceData?.paceDistances as Distance[])
      : defaultDistances;

    return {
      pace,
      distances,
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        pace: z.string().optional(),
        distances: z.array(distanceSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user;
      await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          initialPace: input.pace,
          paceDistances: input.distances,
        },
      });
    }),
});
