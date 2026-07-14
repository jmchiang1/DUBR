"use client";

import { useEffect, useRef, useState } from "react";
import { FilterIcon } from "./icons";

/**
 * The Filter button and the panel it opens. Shared by /players and /events, so
 * the two behave identically — a filter control that works differently on two
 * pages of the same app is two things to learn instead of one.
 *
 * The panel is a POPOVER on desktop (anchored under the button) and a SHEET on
 * mobile (it comes up from the bottom, over a scrim). At 380px wide a popover
 * that hangs off the right edge of a phone is unreachable, and a sheet on a
 * 1440px desktop is a modal for no reason — so it is both, by breakpoint.
 *
 * It closes on Escape, on a click outside it, and on Done. It does NOT close
 * when you change a filter: you almost always set two or three at once, and a
 * panel that shuts after each one would have you reopening it every time.
 */
export function FilterMenu({
  active,
  onReset,
  children,
}: {
  /** How many clauses are currently narrowing the list. 0 = the button is idle. */
  active: number;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    /* pointerdown, not click: a click fires after mouseup, so dragging a slider
       thumb and releasing outside the panel would close it mid-adjustment. */
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="filter-menu" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`filter-btn ${active > 0 ? "is-active" : ""}`}
      >
        <FilterIcon />
        Filter
        {active > 0 && <span className="filter-btn__count">{active}</span>}
      </button>

      {open && (
        <>
          {/* Mobile only — the sheet needs something to sit on and something to
              tap to dismiss. Hidden at desktop widths, where the popover is
              anchored and the outside-click handler is enough. */}
          <div className="filter-menu__scrim" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="filter-menu__panel card" role="dialog" aria-label="Filters">
            <div className="filter-menu__body">{children}</div>

            <div className="filter-menu__foot">
              <button type="button" className="filters__reset" onClick={onReset} disabled={active === 0}>
                Reset all
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
