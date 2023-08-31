import { type NextPage } from "next";
import NextError from "next/error";
import Head from "next/head";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

import { api, type RouterOutputs } from "~/utils/api";
import { siteConfig } from "~/utils/config";
import { formatDistance, formatMovingTime } from "~/utils/format";
import { RunStreakCard } from "~/components/RunStreakCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

type LastRunCardProps = {
  activity: RouterOutputs["activity"]["getDashboardData"]["lastRun"];
};

const LastRunCard = ({ activity }: LastRunCardProps) => {
  const lastRun = activity
    ? `${formatDistance(activity.distance)} in ${formatMovingTime(
        activity.movingTime,
      )}, ${formatDistanceToNow(activity.date)} ago.`
    : `No runs yet`;

  return (
    <Card>
      <CardHeader>Last run</CardHeader>
      <CardContent>{lastRun}</CardContent>
    </Card>
  );
};

const HomePage: NextPage = () => {
  const { data: session } = useSession();
  const { data, refetch, error, status } =
    api.activity.getDashboardData.useQuery(undefined, {
      refetchOnWindowFocus: false,
      enabled: !!session,
    });

  const { mutate: updateActivitesFromStrava } =
    api.strava.getActivities.useMutation({
      onSuccess: () => refetch(),
    });

  if (!session)
    return (
      <>
        <Head>
          <title>{`${siteConfig.name} - Home`}</title>
        </Head>
        <main className="container">
          <h1>Welcome</h1>
        </main>
      </>
    );

  if (error)
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );

  if (status !== "success")
    return (
      <main className="container">
        <p>Loading...</p>
      </main>
    );

  const { streak, lastRun } = data;

  return (
    <>
      <Head>
        <title>{`${siteConfig.name} - Home`}</title>
      </Head>
      <main className="container flex flex-col gap-5">
        <RunStreakCard {...streak} />
        <LastRunCard activity={lastRun} />
        <Button onClick={() => updateActivitesFromStrava()}>
          Update activities from Strava
        </Button>
      </main>
    </>
  );
};

export default HomePage;
