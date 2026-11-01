import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks or taps outside specified element(s).
 * Uses capture-phase listeners ('pointerdown', 'touchstart') so that child
 * elements calling e.stopPropagation() cannot prevent outside-click detection.
 *
 * @param refOrRefs Single React ref or array of refs to treat as "inside"
 * @param handler Callback invoked when an outside click is detected
 * @param active Whether the listener is currently active (defaults to true)
 */
export function useClickOutside(
  refOrRefs: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  handler: (event: MouseEvent | TouchEvent | PointerEvent) => void,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const refs = Array.isArray(refOrRefs) ? refOrRefs : [refOrRefs];
      const isInside = refs.some(ref => ref.current && ref.current.contains(target));

      if (!isInside) {
        handler(event);
      }
    };

    // Capture phase ensures events aren't stopped by child stopPropagation()
    document.addEventListener('pointerdown', listener, true);
    document.addEventListener('touchstart', listener, true);

    return () => {
      document.removeEventListener('pointerdown', listener, true);
      document.removeEventListener('touchstart', listener, true);
    };
  }, [refOrRefs, handler, active]);
}
