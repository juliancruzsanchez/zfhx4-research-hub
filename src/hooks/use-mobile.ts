import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

function computeIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Subscribes to window resize and returns true when the viewport is
 * narrower than the mobile breakpoint.
 *
 * The initial value is computed lazily from the current viewport, so
 * the hook does not need a one-shot setState in the effect body to
 * sync React state with the DOM — the value is correct on the very
 * first render.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => computeIsMobile());

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(computeIsMobile());
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
