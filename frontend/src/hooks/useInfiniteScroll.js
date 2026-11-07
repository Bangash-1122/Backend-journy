import { useEffect, useRef } from 'react';

export function useInfiniteScroll(onLoadMore, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, enabled]);

  return ref;
}
