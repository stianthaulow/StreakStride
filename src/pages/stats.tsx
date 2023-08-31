import type { GetServerSideProps, NextPage } from "next";
import NextError from "next/error";
import Head from "next/head";
import type { Activity } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { getSession } from "next-auth/react";

import { api } from "~/utils/api";
import { siteConfig } from "~/utils/config";
import { formatDistance } from "~/utils/format";
import { ActivityTable } from "~/components/ActivityTable";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "sportType",
    header: "SportType",
  },
  {
    accessorKey: "movingTime",
    header: "Moving Time",
  },
  {
    accessorKey: "elapsedTime",
    header: "Elapsed Time",
  },
  {
    accessorKey: "distance",
    header: "Distance",
  },
  {
    accessorKey: "totalElevationGain",
    header: "Elevation Gain",
  },
];

const Home: NextPage = () => {
  const {
    data: activities,
    refetch: refetchActivities,
    status,
    error,
  } = api.activity.getAll.useQuery();

  const strava = api.strava.getActivities.useMutation({
    onSuccess: () => void refetchActivities(),
  });

  if (status === "loading") {
    return (
      <main className="container">
        <p>Loading...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{siteConfig.name} - Strava Stats</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container">
        <div className="flex  justify-between">
          <Card>
            <CardContent>
              <div className="stat">
                <div className="stat-title">Total Activities</div>
                <div className="stat-value">{activities.totalStats?.count}</div>
                <div className="stat-desc">
                  {formatDistance(activities.totalStats?.distance || 0)}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Total Runs</div>
                <div className="stat-value">
                  {activities.totalRunStats?.count}
                </div>
                <div className="stat-desc">
                  <strong>{activities.stats.Run?.count}</strong> run |{" "}
                  <strong>{activities.stats.TrailRun?.count}</strong> trail |{" "}
                  <strong>{activities.stats.VirtualRun?.count}</strong> virtual
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Ski</div>
                <div className="stat-value">
                  {activities.totalSkiStats?.count}
                </div>
                <div className="stat-desc">
                  <strong>{activities.stats.NordicSki?.count}</strong> nordic |{" "}
                  <strong>
                    {activities.stats.BackcountrySki?.count} back country
                  </strong>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Rides</div>
                <div className="stat-value">{activities.stats.Ride?.count}</div>
                <div className="stat-desc">
                  {formatDistance(activities.stats?.Ride?.distance || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            {strava.isLoading ? (
              <button className="btn-outline loading btn mr-2 border-[#fc4c02] text-white">
                Loading strava data...
              </button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => void strava.mutateAsync({ includeAll: true })}
                >
                  Get All Strava Activities
                </Button>
                <Button
                  onClick={() => void strava.mutateAsync({ includeAll: false })}
                >
                  Get Latest Strava Activities
                </Button>
              </>
            )}
          </div>
        </div>
        <ActivityTable columns={columns} data={activities.list} />
      </main>
    </>
  );
};

export default Home;
