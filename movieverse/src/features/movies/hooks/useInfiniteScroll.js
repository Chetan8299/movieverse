import { useEffect, useRef, useCallback } from "react";

/**
 * Calls loadMore when the sentinel element enters the viewport.
 * @param {() => void | Promise<void>} loadMore
 * @param {boolean} hasMore
 * @param {boolean} loading
 * @returns ref to attach to the sentinel element
 */
export function useInfiniteScroll(loadMore, hasMore, loading) {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting || !hasMore || loading) return;
      loadMore();
    },
    [loadMore, hasMore, loading]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return sentinelRef;
}
