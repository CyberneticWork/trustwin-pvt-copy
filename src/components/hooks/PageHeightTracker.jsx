"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePageHeight } from "./usePageHeight";

/**
 * A component that wraps page content and tracks its height
 */
export function PageHeightTracker({ children }) {
  const pathname = usePathname();
  const { measureHeight } = usePageHeight(pathname);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // Measure after the content is fully rendered
      const observer = new MutationObserver(() => {
        measureHeight();
      });

      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // Cleanup observer
      return () => observer.disconnect();
    }
  }, [measureHeight]);

  return (
    <div ref={contentRef} className="page-content-wrapper">
      {children}
    </div>
  );
}
