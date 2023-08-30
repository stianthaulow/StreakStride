import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import type { Activity } from "@prisma/client";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { formatDistance } from "~/utils/format";
import { ActivityRow } from "~/components/ActivityRow";

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

const columnHelper = createColumnHelper<Activity>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("date", { header: "Date" }),
  columnHelper.accessor("sportType", { header: "SportType" }),
  columnHelper.accessor("movingTime", { header: "Moving Time" }),
  columnHelper.accessor("elapsedTime", { header: "Elapsed Time" }),
  columnHelper.accessor("distance", { header: "Distance" }),
  columnHelper.accessor("totalElevationGain", { header: "Elevation Gain" }),
];

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  const activities = api.activity.getAll.useQuery();

  const strava = api.strava.getActivities.useMutation({
    onSuccess: () => void activities.refetch(),
  });

  const table = useReactTable({
    data: activities.data?.list || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Head>
        <title>Strava Stats</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <a className="btn-ghost btn text-xl normal-case">Strava Stats</a>
        </div>
        <div className="navbar-end">
          <div>
            {strava.isLoading ? (
              <button className="btn-outline loading btn mr-2 border-[#fc4c02] text-white">
                Loading strava data...
              </button>
            ) : (
              <>
                <button
                  className="btn-outline btn mr-2 "
                  onClick={() => void strava.mutateAsync({ includeAll: true })}
                >
                  Get All Strava Activities
                </button>
                <button
                  className="btn mr-2 bg-[#fc4c02] text-white"
                  onClick={() => void strava.mutateAsync({ includeAll: false })}
                >
                  Get Latest Strava Activities
                </button>
              </>
            )}
          </div>

          <button
            className="btn"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
        </div>
      </div>
      <main className="flex min-h-screen flex-col">
        <div className="overflow-x-auto">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Activities</div>
              <div className="stat-value">
                {activities.data?.totalStats?.count}
              </div>
              <div className="stat-desc">
                {formatDistance(activities.data?.totalStats?.distance || 0)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Runs</div>
              <div className="stat-value">
                {activities.data?.totalRunStats?.count}
              </div>
              <div className="stat-desc">
                <strong>{activities.data?.stats.Run?.count}</strong> run |{" "}
                <strong>{activities.data?.stats.TrailRun?.count}</strong> trail
                | <strong>{activities.data?.stats.VirtualRun?.count}</strong>{" "}
                virtual
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Ski</div>
              <div className="stat-value">
                {activities.data?.totalSkiStats?.count}
              </div>
              <div className="stat-desc">
                <strong>{activities.data?.stats.NordicSki?.count}</strong>{" "}
                nordic |{" "}
                <strong>
                  {activities.data?.stats.BackcountrySki?.count} back country
                </strong>
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Rides</div>
              <div className="stat-value">
                {activities.data?.stats.Ride?.count}
              </div>
              <div className="stat-desc">
                {formatDistance(activities.data?.stats?.Ride?.distance || 0)}
              </div>
            </div>
          </div>
          <table className="table-compact table w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.column.columnDef.header?.toString()}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {activities.data ? (
                activities.data.list.map((activity) => (
                  <ActivityRow key={`${activity.id}`} activity={activity} />
                ))
              ) : (
                <tr>
                  <th colSpan={6}>Loading...</th>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Home;
