import type { RouterOutputs } from "~/utils/api";
import { formatDistance, formatTime } from "~/utils/format";

type ActivityRowProps = {
  activity: RouterOutputs["activity"]["getAll"]["list"][0];
};

export const ActivityRow = ({ activity }: ActivityRowProps) => {
  return (
    <tr>
      <th>{activity.name}</th>
      <td>{activity.date.toLocaleDateString("en-SE")}</td>
      <td>{activity.sportType}</td>
      <td>{formatTime(activity.movingTime)}</td>
      <td>{formatTime(activity.elapsedTime)}</td>
      <td>{formatDistance(activity.distance)}</td>
      <td>{activity.totalElevationGain}m</td>
    </tr>
  );
};
