import { useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import NextError from "next/error";
import Head from "next/head";
import type { Activity } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, subDays } from "date-fns";
import { getSession } from "next-auth/react";
import type { DateRange } from "react-day-picker";

import { api } from "~/utils/api";
import { siteConfig } from "~/utils/config";
import {
  formatActivityDate,
  formatDistance,
  formatMovingTime,
} from "~/utils/format";
import { ActivityTable } from "~/components/ActivityTable";
import { DataTableColumnHeader } from "~/components/ActivityTableColumn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { Switch } from "~/components/ui/switch";
import { Toggle } from "~/components/ui/toggle";
import { SportTypeSchema, type SportType } from "~/server/strava";

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
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="When"
        ascLabel="Earliest first"
        descLabel="Latest first"
      />
    ),
    cell: ({ row }) => {
      const date: Date = row.getValue("date");
      const formated = formatActivityDate(date);
      const since = formatDistanceToNow(date);
      return (
        <p>
          {formated}, {since} ago
        </p>
      );
    },
  },
  {
    accessorKey: "sportType",
    header: "Sport Type",
  },
  {
    accessorKey: "movingTime",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Moving time"
        descLabel="Longest first"
        ascLabel="Shortest first"
      />
    ),
    cell: ({ row }) => {
      const movingTime: number = row.getValue("movingTime");
      const formated = formatMovingTime(movingTime);
      return <p>{formated}</p>;
    },
  },
  {
    accessorKey: "distance",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Distance"
        ascLabel="Shortest first"
        descLabel="Longest first"
      />
    ),
    cell: ({ row }) => {
      const distance: number = row.getValue("distance");
      const formated = formatDistance(distance);
      return <p>{formated}</p>;
    },
  },
  {
    accessorKey: "totalElevationGain",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Elevation gain"
        ascLabel="Least first"
        descLabel="Most first"
      />
    ),
    cell: ({ row }) => {
      const elevationGain: number = row.getValue("totalElevationGain");
      const formated = Math.round(elevationGain);
      return <p>{formated}m</p>;
    },
  },
];

type StatCardProps = {
  title: string;
  value: number;
  description: React.ReactNode;
};

const StatCard = ({ title, value, description }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl">{value}</p>
        <p className="text-xs">{description}</p>
      </CardContent>
    </Card>
  );
};

const sportTypes = [
  {
    name: "Run",
    value: "Run",
    defaultSeleted: true,
  },
  {
    name: "Virtual Run",
    value: "VirtualRun",
    defaultSeleted: true,
  },
  {
    name: "Trail Run",
    value: "TrailRun",
    defaultSeleted: true,
  },
  {
    name: "Ride",
    value: "Ride",
    defaultSeleted: false,
  },
  {
    name: "Virtual Ride",
    value: "VirtualRide",
    defaultSeleted: false,
  },
  {
    name: "Nordic Ski",
    value: "NordicSki",
    defaultSeleted: false,
  },
] as const;

const allRun: SportType[] = ["Run", "VirtualRun", "TrailRun"];
const allRide: SportType[] = ["Ride", "VirtualRide"];

const initialSportTypeFilter = sportTypes
  .filter((sportType) => sportType.defaultSeleted)
  .map((sportType) => sportType.value);

const Home: NextPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [sportTypeFilter, setSportTypeFilter] = useState(
    initialSportTypeFilter as SportType[],
  );
  const [includeCommutes, setIncludeCommutes] = useState(true);

  const isSportTypeIncluded = (sportType: SportType | SportType[]) =>
    Array.isArray(sportType)
      ? sportType.every((type) => sportTypeFilter.includes(type))
      : sportTypeFilter.includes(sportType);

  const isAllSportTypesIncluded =
    sportTypeFilter.length === SportTypeSchema.options.length;

  const toggleSportType = (sportType: SportType) => {
    setSportTypeFilter((prev) => {
      if (prev.includes(sportType)) {
        return prev.filter((type) => type !== sportType);
      }

      return [...prev, sportType];
    });
  };

  const toggleAllSportTypes = () =>
    isAllSportTypesIncluded
      ? setSportTypeFilter(initialSportTypeFilter)
      : setSportTypeFilter(SportTypeSchema.options);

  const {
    data: activities,
    refetch: refetchActivities,
    status,
    error,
  } = api.activity.get.useQuery(
    {
      sportTypes: sportTypeFilter,
    },
    {
      keepPreviousData: true,
    },
  );

  const strava = api.strava.getActivities.useMutation({
    onSuccess: () => void refetchActivities(),
  });

  if (!activities) {
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
      <main className="container flex flex-col gap-4">
        <div className="flex  justify-between">
          <div className="flex gap-2">
            <StatCard
              title="Total Runs"
              value={activities.totalRunStats?.count}
              description={
                <>
                  <strong>{activities.stats.Run?.count}</strong> run |{" "}
                  <strong>{activities.stats.TrailRun?.count}</strong> trail |{" "}
                  <strong>{activities.stats.VirtualRun?.count}</strong> virtual
                </>
              }
            />

            <StatCard
              title="Total Ski"
              value={activities.totalSkiStats?.count}
              description={
                <>
                  <strong>{activities.stats.NordicSki?.count}</strong> nordic |{" "}
                  <strong>{activities.stats.BackcountrySki?.count}</strong>{" "}
                  backcountry
                </>
              }
            />

            <StatCard
              title="Total Rides"
              value={activities.stats.Ride?.count}
              description={formatDistance(
                activities.stats?.Ride?.distance || 0,
              )}
            />

            <StatCard
              title="Total Activities"
              value={activities.totalStats?.count}
              description={formatDistance(activities.totalStats?.distance || 0)}
            />
          </div>

          <section className="flex flex-col items-end gap-4">
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-56"
                    variant="secondary"
                    disabled={strava.isLoading}
                  >
                    Get All Strava Activities
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This loads all your activities from Strava, it can take a
                      while. Only do this if you have changed past activities in
                      Strava, or the first time you use this app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        onClick={() =>
                          void strava.mutateAsync({ includeAll: true })
                        }
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                className="w-56"
                disabled={strava.isLoading}
                onClick={() => void strava.mutateAsync({ includeAll: false })}
              >
                Get Latest Strava Activities
              </Button>
            </div>
            {strava.isLoading && (
              <div className="flex gap-2">
                <Spinner size="sm" />
                <p>Loading Strava data...</p>
              </div>
            )}
          </section>
        </div>

        <Separator className="my-4" />

        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />

        <div className="flex justify-between">
          <div className="flex gap-2">
            {sportTypes.map((sportType) => (
              <Toggle
                key={sportType.value}
                variant="outline"
                pressed={isSportTypeIncluded(sportType.value)}
                onPressedChange={() => toggleSportType(sportType.value)}
              >
                {sportType.name}
              </Toggle>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-2 flex gap-2">
              Include commutes?
              <Switch
                checked={includeCommutes}
                onCheckedChange={(checked) => setIncludeCommutes(checked)}
              />
            </div>
            <Toggle
              pressed={isSportTypeIncluded(allRun)}
              onPressedChange={() => setSportTypeFilter(allRun)}
              variant="outline"
            >
              All Run
            </Toggle>
            <Toggle
              pressed={isSportTypeIncluded(allRide)}
              onPressedChange={() => setSportTypeFilter(allRide)}
              variant="outline"
            >
              All Ride
            </Toggle>
            <Toggle
              pressed={isAllSportTypesIncluded}
              onPressedChange={toggleAllSportTypes}
              variant="outline"
            >
              All
            </Toggle>
            <Toggle
              pressed={sportTypeFilter.length === 0}
              onPressedChange={() => setSportTypeFilter([])}
              variant="outline"
            >
              None
            </Toggle>
          </div>
        </div>

        <div className=" flex h-5 gap-2">
          <p>
            <span className="font-bold">Activity count:</span>{" "}
            {activities.list.length}
          </p>
          <Separator orientation="vertical" />
          <p>
            <span className="font-bold">Total distance:</span>{" "}
            {formatDistance(
              activities.list.reduce((a, b) => a + b.distance, 0),
            )}
          </p>
          <Separator orientation="vertical" />
          <p>
            <span className="font-bold">Total moving time:</span>{" "}
            {formatMovingTime(
              activities.list.reduce((a, b) => a + b.movingTime, 0),
            )}
          </p>
        </div>

        <ActivityTable columns={columns} data={activities.list} />
      </main>
    </>
  );
};

export default Home;
