import { useEffect, useRef, useState } from "react";

// Transparent 1x1 GIF keeps the layout stable until the real image is requested.
const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Deferred image loading, mirroring the approach used on fireworksshowsimulator.com:
// the real source is only requested once the image scrolls within 200px of the viewport.
export default function LazyImage({
  src,
  srcSet,
  sizes,
  alt = "",
  priority = false,
  rootMargin = "200px 0px",
  ...imgProps
}) {
  const imageRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (shouldLoad) return undefined;

    const node = imageRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          setShouldLoad(true);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldLoad]);

  return (
    <img
      ref={imageRef}
      src={shouldLoad ? src : PLACEHOLDER}
      srcSet={shouldLoad ? srcSet : undefined}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...imgProps}
    />
  );
}
