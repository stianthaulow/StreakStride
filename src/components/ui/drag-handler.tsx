import type { PropsWithChildren } from "react";
import { GripHorizontal } from "lucide-react";

export const DragHandler = (props: PropsWithChildren) => (
  <div
    {...props}
    className="flex items-center justify-center transition duration-150  ease-in-out  hover:scale-y-125 hover:text-white"
    title="Drag to reorder"
  >
    <GripHorizontal />
  </div>
);

export const DummyDragHandler = () => <div />;
