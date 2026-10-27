import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component
 * Listens to React Router location changes and restores window scroll to (0, 0).
 * Resolves the issue where navigating from footer or mid-page buttons left the user
 * stuck at the bottom or middle of destination pages such as /how-we-work.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, search]);

  return null;
}
