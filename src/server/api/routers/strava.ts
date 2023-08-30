import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { refreshStravaAccessToken } from "~/server/auth";
import { getActivities } from "~/server/strava";

export const stravaRouter = createTRPCRouter({
  getActivities: protectedProcedure
    .input(z.object({ includeAll: z.boolean() }).optional())
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!account) {
        throw new Error("No account found");
      }

      if (!account.access_token) {
        throw new Error("No access token found");
      }

      const expiryDate = new Date(account.expires_at || 1 * 1000);
      const hasExpired = !account.expires_at || expiryDate < new Date();

      let accessToken = account.access_token;

      if (hasExpired) {
        if (!account.refresh_token) {
          throw new Error("Access token expiret, no refresh token found");
        }

        const refreshedTokens = await refreshStravaAccessToken(
          account.refresh_token,
        );

        if (!refreshedTokens) {
          throw new Error("Failed to refresh token");
        }

        await ctx.prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            access_token: refreshedTokens.access_token,
            expires_at: refreshedTokens.expires_at,
            refresh_token: refreshedTokens.refresh_token,
          },
        });

        accessToken = refreshedTokens.access_token;
      }

      let fetchedActivities: Awaited<ReturnType<typeof getActivities>> = [];
      let page = 1;
      do {
        fetchedActivities = await getActivities(accessToken, page);
        await ctx.prisma.$transaction(
          fetchedActivities.map((activity) => {
            const { id, ...update } = activity;
            return ctx.prisma.activity.upsert({
              where: { id: activity.id },
              update,
              create: {
                id,
                ...update,
                userId: ctx.session.user.id,
              },
            });
          }),
        );
        page++;
      } while (fetchedActivities.length > 0 && input?.includeAll);
    }),
});
