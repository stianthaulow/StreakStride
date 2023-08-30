import { useEffect, type RefObject } from "react";

function usePreventScroll(ref: RefObject<HTMLInputElement>) {
  const preventScroll = (e: globalThis.WheelEvent) => e.preventDefault();
  useEffect(() => {
    const input = ref.current;
    if (input) {
      input.addEventListener("wheel", preventScroll, {
        passive: false,
      });
      return () => {
        input.removeEventListener("wheel", preventScroll);
      };
    }
  }, [ref]);
}

export default usePreventScroll;
