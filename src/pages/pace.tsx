import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
  type WheelEvent,
} from "react";
import {
  SortableItem,
  SortableList,
  type SortableItemProps,
} from "@thaddeusjiang/react-sortable-list";
import { Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { z } from "zod";

import { api } from "~/utils/api";
import { timeToAddFromCursor } from "~/utils/cursor";
import {
  formatPaceForDistance,
  isValidTime,
  parsePaceForDistance,
  validTimePattern,
} from "~/utils/pace";
import { AddForm } from "~/components/AddForm";
import { Button } from "~/components/ui/button";
import { DragHandler, DummyDragHandler } from "~/components/ui/drag-handler";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Toggle } from "~/components/ui/toggle";
import useDebounce from "~/hooks/useDebounce";
import useIsomorphicLayoutEffect from "~/hooks/useIsomorphicLayoutEffect";
import usePreventScroll from "~/hooks/usePreventScroll";

type PaceInputProps = {
  id: string;
  label: string;
  distanceInMeters: number;
  showMs: boolean;
  pattern: string;
  isValid: (value: string) => boolean;
  msPrMeter: number;
  dispatchPace: Dispatch<SetStateAction<number>>;
};

function PaceInput({
  id,
  label,
  pattern,
  msPrMeter,
  distanceInMeters,
  showMs,
  isValid,
  dispatchPace,
}: PaceInputProps) {
  const getDisplayValue = formatPaceForDistance(distanceInMeters, showMs);
  const getPaceValue = parsePaceForDistance(distanceInMeters);

  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(getDisplayValue(msPrMeter));
  const debouncedValue = useDebounce(value, 1000);
  const [isSource, setIsSource] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      stepInput(e.currentTarget, e.key === "ArrowDown" ? "down" : "up");
    }
  };

  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    stepInput(e.currentTarget, e.deltaY > 0 ? "down" : "up");
  };

  const stepInput = (elem: HTMLInputElement, direction: "up" | "down") => {
    setCursorPosition(elem.selectionStart);
    const directionFactor = direction === "up" ? 1 : -1;
    const timeToAdd = timeToAddFromCursor(elem);
    const newPace = msPrMeter + getPaceValue(timeToAdd) * directionFactor;
    dispatchPace(newPace);
  };

  // Dispatch pace updates
  useEffect(() => {
    if (!isValid(debouncedValue)) return;
    if (isSource) {
      dispatchPace(getPaceValue(debouncedValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, dispatchPace]);

  // React to pace updates
  useEffect(() => {
    const newDisplayValue = getDisplayValue(msPrMeter);
    if (newDisplayValue !== value && !isSource) {
      setValue(newDisplayValue);
    }
    setIsSource(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msPrMeter]);

  // Reset cursor position on stepping
  useIsomorphicLayoutEffect(() => {
    if (cursorPosition && ref.current) {
      ref.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [value]);

  usePreventScroll(ref);
  return (
    <fieldset className="flex items-center gap-2 py-1">
      <Input
        ref={ref}
        type="text"
        id={id}
        className="h-7 w-24 invalid:bg-red-900 dark:invalid:bg-red-900"
        placeholder="00:00.000"
        pattern={pattern}
        value={value}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onFocus={(e) =>
          e.currentTarget.setSelectionRange(value.length, value.length)
        }
        onChange={(e) => {
          setCursorPosition(null);
          setIsSource(true);
          setValue(e.target.value);
        }}
      />
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
    </fieldset>
  );
}

export const distanceSchema = z.object({
  id: z.string(),
  distanceInMeters: z
    .number({ invalid_type_error: "Distance has to be a number" })
    .min(1)
    .max(100_000_000),
  label: z
    .string({ required_error: "You need to specify a label for the distance" })
    .min(1)
    .max(20),
  showMs: z.boolean().default(false),
});

export type Distance = z.infer<typeof distanceSchema>;

type SortableDistance = Distance | SortableItemProps;

export const defaultPace = "04:30";

export const defaultDistances: Distance[] = [
  {
    id: "100m",
    label: "100m",
    distanceInMeters: 100,
    showMs: true,
  },
  {
    id: "1km",
    label: "min/km",
    distanceInMeters: 1000,
    showMs: false,
  },
  {
    id: "1500m",
    label: "1500m",
    distanceInMeters: 1500,
    showMs: false,
  },
  {
    id: "mile",
    label: "min/mile",
    distanceInMeters: 1609.34,
    showMs: false,
  },
  {
    id: "3000m",
    label: "3000m",
    distanceInMeters: 3000,
    showMs: false,
  },
  {
    id: "5km",
    label: "5k",
    distanceInMeters: 5000,
    showMs: false,
  },
  {
    id: "10km",
    label: "10k",
    distanceInMeters: 10_000,
    showMs: false,
  },
  {
    id: "15km",
    label: "15k",
    distanceInMeters: 15_000,
    showMs: false,
  },
];

export default function PacePage() {
  const { data: session } = useSession();
  const { data: storedData } = api.pace.get.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: false,
    onSuccess: ({ pace, distances }) => {
      setMsPrMeter(parsePaceForDistance(1000)(pace));
      setDistances(distances);
    },
  });

  const { mutate: saveData } = api.pace.update.useMutation();
  const saveDistances = (distances: Distance[]) => {
    if (session?.user) {
      saveData({
        distances,
      });
    }
  };
  const savePace = (paceString: string) => {
    if (session?.user) {
      saveData({
        pace: paceString,
      });
    }
  };

  const initalPace = storedData ? storedData.pace : defaultPace;
  const initialDistances = storedData ? storedData.distances : defaultDistances;

  const [distances, setDistances] = useState(
    initialDistances as SortableDistance[],
  );

  useEffect(() => {
    if (
      !session?.user ||
      !storedData ||
      JSON.stringify(storedData.distances) === JSON.stringify(distances)
    )
      return;

    saveDistances(distances as Distance[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distances, session?.user]);

  const intialMsPrMeter = parsePaceForDistance(1000)(initalPace);
  const [msPrMeter, setMsPrMeter] = useState(intialMsPrMeter);
  const debouncedMsPrMeter = useDebounce(msPrMeter, 500);

  const [isEditing, setIsEditing] = useState(false);

  const resetDistances = () => setDistances(initialDistances);

  const sortDistances = () => {
    setDistances((prev) => {
      const sortedDistances = [...prev].sort(
        (a, b) => a.distanceInMeters - b.distanceInMeters,
      );
      saveDistances(sortedDistances as Distance[]);
      return sortedDistances;
    });
  };

  const addDistance = (distance: Distance) => {
    setDistances((prev) => {
      const newDistances = [...prev, distance];
      saveDistances(newDistances as Distance[]);
      return newDistances;
    });
  };
  const deleteDistance = (id: string) => {
    setDistances((prev) => {
      const newDistances = prev.filter((distance) => distance.id !== id);
      saveDistances(newDistances as Distance[]);
      return newDistances;
    });
  };

  useEffect(() => {
    if (!session?.user) return;
    const paceString = formatPaceForDistance(1000)(debouncedMsPrMeter);
    if (paceString !== storedData?.pace) {
      savePace(paceString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMsPrMeter]);

  return (
    <main className="container">
      <SortableList
        items={distances}
        setItems={setDistances}
        disabled={!isEditing}
      >
        {({ items }: { items: SortableItemProps[] }) => (
          <>
            {items.map((item: SortableItemProps) => {
              const { id, distanceInMeters, label, showMs } = item as Distance;
              return (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  className="flex items-center gap-2"
                  DragHandler={isEditing ? DragHandler : DummyDragHandler}
                >
                  {isEditing && (
                    <Button
                      title="Delete distance"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-gray-500 p-0"
                      variant="destructive"
                      onClick={() => deleteDistance(id)}
                    >
                      <Trash2 className="m-0 h-4 w-4 " />
                    </Button>
                  )}
                  <PaceInput
                    id={id}
                    distanceInMeters={distanceInMeters}
                    label={label}
                    showMs={showMs}
                    pattern={validTimePattern}
                    isValid={isValidTime}
                    msPrMeter={msPrMeter}
                    dispatchPace={setMsPrMeter}
                  />
                </SortableItem>
              );
            })}
          </>
        )}
      </SortableList>
      {isEditing && (
        <div className="flex gap-2 pt-2">
          <Button size={"sm"} onClick={sortDistances} variant="outline">
            Sort by distance
          </Button>
          <Button size={"sm"} onClick={resetDistances} variant="outline">
            Reset to default
          </Button>
        </div>
      )}
      <AddForm addDistance={addDistance} />
      <Toggle
        title="Edit distances"
        className="m-0 h-12 w-12 rounded-full"
        onPressedChange={setIsEditing}
      >
        <Pencil className="m-0 h-8 w-8 " />
      </Toggle>
    </main>
  );
}
