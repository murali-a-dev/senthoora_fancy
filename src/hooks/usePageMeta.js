/**
 * usePageMeta — sets <title> and <meta name="description"> per page.
 * No extra library needed (no react-helmet-async required).
 *
 * Usage:
 *   usePageMeta('Products | Sri Senthoora Fancy Store', 'Browse bangles and jewelry…');
 */
import { useEffect } from 'react';

export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    // Cleanup: restore default on unmount (optional — prevents stale title on navigation)
    return () => {
      document.title = 'Sri Senthoora Fancy Store';
    };
  }, [title, description]);
}
