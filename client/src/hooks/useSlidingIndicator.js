import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

// Where an item sits inside its list. Without fitHeight only the left edge
// and width are used, so an underline keeps its own height and position.
const measure = (item, fitHeight) =>
  fitHeight
    ? { x: item.offsetLeft, y: item.offsetTop, width: item.offsetWidth, height: item.offsetHeight }
    : { x: item.offsetLeft, width: item.offsetWidth };

// Slides an indicator (an underline or a highlight) onto the selected item of
// a list with GSAP. Put `listRef` on the list (it must be positioned), set
// `itemsRef.current[index]` on each item, and put `indicatorRef` on the
// indicator: an absolutely positioned, initially `invisible` element at the
// list's left edge. Used by Tabs and SegmentedControl.
export const useSlidingIndicator = (activeIndex, { fitHeight = true } = {}) => {
  const listRef = useRef(null);
  const itemsRef = useRef([]);
  const indicatorRef = useRef(null);
  // The index the indicator was last placed on; null before the first placement
  const placedIndex = useRef(null);

  useLayoutEffect(() => {
    const item = itemsRef.current[activeIndex];
    const indicator = indicatorRef.current;
    if (!indicator) return;
    if (!item) {
      gsap.set(indicator, { autoAlpha: 0 });
      return;
    }

    const target = measure(item, fitHeight);
    const moved = placedIndex.current !== null && placedIndex.current !== activeIndex;
    placedIndex.current = activeIndex;

    if (!moved || prefersReducedMotion()) {
      gsap.set(indicator, { ...target, autoAlpha: 1 });
      return;
    }

    const tween = gsap.to(indicator, {
      ...target,
      autoAlpha: 1,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
    item.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });

    // Picking another item mid-slide stops this one; the next slide starts
    // from wherever the indicator is
    return () => tween.kill();
  }, [activeIndex, fitHeight]);

  // Keep the indicator on its item when sizes change, e.g. when filter counts
  // load or the page is zoomed
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const item = itemsRef.current[activeIndex];
      const indicator = indicatorRef.current;
      if (!item || !indicator || gsap.isTweening(indicator)) return;
      gsap.set(indicator, measure(item, fitHeight));
    });
    observer.observe(listRef.current);
    itemsRef.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, [activeIndex, fitHeight]);

  return { listRef, itemsRef, indicatorRef };
};
