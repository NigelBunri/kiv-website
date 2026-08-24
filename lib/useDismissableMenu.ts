import { useEffect } from "react";

// Escape key and click-outside both close a dropdown/drawer - standard
// expectations for any menu that overlays page content. Shared by the
// site header's mobile nav (SiteShell) and the control-panel sidebar
// drawer (ControlShell).
export function useDismissableMenu(
  isOpen: boolean,
  close: () => void,
  panelRef: React.RefObject<HTMLElement | null>,
  toggleRef: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      // The toggle button itself must be excluded here, not just the panel -
      // mousedown fires (and bubbles to this document listener) BEFORE the
      // button's own onClick. Without this check, clicking the button to
      // close an open menu would: (1) this handler sees the button as
      // "outside the panel" and closes it, then (2) the button's own onClick
      // fires next and toggles the now-closed state back open - so the
      // button appeared to only ever open the menu, never close it.
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        toggleRef.current && !toggleRef.current.contains(target)
      ) {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen, close, panelRef, toggleRef]);
}
