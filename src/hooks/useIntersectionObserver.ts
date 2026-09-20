import { useEffect, useRef, useState, type RefObject } from 'react';

export interface UseIntersectionObserverOptions {
  /**
   * Minimum ratio of target's visibility needed before triggering.
   * Default: 0.12
   */
  threshold?: number | number[];
  /**
   * Margin around the root. Default: '0px 0px -50px 0px' (triggers slightly before reaching bottom)
   */
  rootMargin?: string;
  /**
   * If true, observer disconnects after first intersection.
   * Default: true
   */
  triggerOnce?: boolean;
  /**
   * Optional manual override to disable observation.
   */
  disabled?: boolean;
}

/**
 * Custom hook wrapping native IntersectionObserver.
 * Smoothly detects when an element scrolls into the user's viewport.
 * Automatically respects `prefers-reduced-motion` for accessibility.
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean, IntersectionObserverEntry | null] {
  const {
    threshold = 0.12,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    disabled = false,
  } = options;

  const targetRef = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    if (disabled) {
      setIsIntersecting(true);
      return;
    }

    const node = targetRef.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    // Immediately show if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        if (observerEntry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, disabled]);

  return [targetRef, isIntersecting, entry];
}
