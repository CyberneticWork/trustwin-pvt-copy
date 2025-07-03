import { useState, useEffect } from "react";

/**
 * A custom hook that tracks the page height when navigating between routes
 * @param {string} currentPath - The current path from usePathname()
 * @returns {Object} An object containing the pageHeight and a function to update it
 */
export function usePageHeight(currentPath) {
  const [pageHeights, setPageHeights] = useState({});
  const [currentHeight, setCurrentHeight] = useState(0);

  // Update the height measurement when the path changes or content loads/updates
  useEffect(() => {
    // Wait for the DOM to finish rendering
    const timeoutId = setTimeout(() => {
      // Get height of the document or main content area
      const height =
        document.documentElement.scrollHeight || document.body.scrollHeight;

      // Update the height for the current path
      setPageHeights((prev) => ({
        ...prev,
        [currentPath]: height,
      }));

      setCurrentHeight(height);
      console.log(`Page height for ${currentPath}: ${height}px`);
    }, 500); // Small delay to ensure content is rendered

    return () => clearTimeout(timeoutId);
  }, [currentPath]);

  // Also listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      const height =
        document.documentElement.scrollHeight || document.body.scrollHeight;

      setPageHeights((prev) => ({
        ...prev,
        [currentPath]: height,
      }));

      setCurrentHeight(height);
      console.log(`Page height updated for ${currentPath}: ${height}px`);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentPath]);

  // Function to manually measure the height
  const measureHeight = () => {
    const height =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    setPageHeights((prev) => ({
      ...prev,
      [currentPath]: height,
    }));

    setCurrentHeight(height);
    console.log(`Page height measured for ${currentPath}: ${height}px`);
    return height;
  };

  return {
    pageHeights,
    currentHeight,
    measureHeight,
  };
}
