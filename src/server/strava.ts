import querystring from "querystring";

const baseUrl = "https://www.strava.com/api/v3/";

export type SportType =
  | "AlpineSki"
  | "BackcountrySki"
  | "Canoeing"
  | "Crossfit"
  | "EBikeRide"
  | "Elliptical"
  | "Golf"
  | "Handcycle"
  | "Hike"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "NordicSki"
  | "Ride"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Run"
  | "Sail"
  | "Skateboard"
  | "Snowboard"
  | "Snowshoe"
  | "Soccer"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "Swim"
  | "TrailRun"
  | "Velomobile"
  | "VirtualRide"
  | "VirtualRun"
  | "Walk"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

enum ResourceState {
  Meta = 1,
  Summary = 2,
  Detail = 3,
}

type MetaAthlete = {
  id: number;
  resource_state: ResourceState;
};

type PolylineMap = {
  id: string;
  polyline: string;
  resource_state: ResourceState;
  summary_polyline: string;
};

type LatLng = [number, number];

type SummaryActivity = {
  resource_state: ResourceState;
  athlete: MetaAthlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  sport_type: SportType;
  workout_type: number;
  id: number;
  external_id: string;
  upload_id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng: LatLng;
  end_latlng: LatLng;
  location_city: string;
  location_state: string;
  location_country: string;
  start_latitude: number;
  start_longitude: number;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: PolylineMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: string;
  from_accepted_tag: boolean;
  upload_id_str: string;
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  average_temp: number;
  average_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  device_watts: boolean;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  max_watts: number;
  elev_high: number;
  elev_low: number;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
  suffer_score: number;
};

export const getActivities = async (token: string, page = 1) => {
  const qs = querystring.stringify({ page });
  const response = await fetch(`${baseUrl}athlete/activities?${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const activities = (await response.json()) as SummaryActivity[];
  return activities?.map(mapActivity);
};

function mapActivity(activity: SummaryActivity) {
  return {
    id: activity.id,
    name: activity.name,
    date: new Date(activity.start_date),
    sportType: activity.sport_type,
    distance: activity.distance,
    movingTime: activity.moving_time,
    elapsedTime: activity.elapsed_time,
    totalElevationGain: activity.total_elevation_gain,
  };
}
