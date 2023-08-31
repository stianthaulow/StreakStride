import { type NextPage } from "next";
import NextError from "next/error";
import Head from "next/head";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

import { api, type RouterOutputs } from "~/utils/api";
import { siteConfig } from "~/utils/config";
import { formatDistance, formatMovingTime, formatTime } from "~/utils/format";
import { RunStreakCard } from "~/components/RunStreakCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type LastRunCardProps = {
  activity: RouterOutputs["activity"]["getDashboardData"]["lastRun"];
};

const LastRunCard = ({ activity }: LastRunCardProps) => {
  const distance = activity ? formatDistance(activity.distance) : "";
  const movingTime = activity ? formatTime(activity.movingTime) : "";
  const when = activity ? formatDistanceToNow(activity.date) : "";

  return (
    <Card className="grow">
      <CardHeader>
        <CardTitle>Last run</CardTitle>
      </CardHeader>
      <CardContent>
        {activity ? (
          <>
            <p>{distance}</p>
            <p>in {movingTime}</p>
            <p>{when} ago</p>
          </>
        ) : (
          <p>No runs yet</p>
        )}
      </CardContent>
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

  const { streak, lastRun, totals } = data;

  return (
    <>
      <Head>
        <title>{`${siteConfig.name} - Home`}</title>
      </Head>
      <main className="container flex flex-col gap-5">
        <RunStreakCard {...streak} />

        <div className="flex gap-2">
          <LastRunCard activity={lastRun} />
          {Object.entries(totals).map(([key, period]) => (
            <Card key={key} className="grow">
              <CardHeader>
                <CardTitle>{period.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <span className="font-bold">Total distance:</span>{" "}
                  {formatDistance(period.distance)}
                </p>
                <p>
                  <span className="font-bold">Moving time:</span>{" "}
                  {formatMovingTime(period.movingTime)}
                </p>
                <p>
                  <span className="font-bold">Elevation gain:</span>{" "}
                  {Math.round(period.elevationGain)}m
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button onClick={() => updateActivitesFromStrava()}>
          Update activities from Strava
        </Button>
      </main>
    </>
  );
};

export default HomePage;
