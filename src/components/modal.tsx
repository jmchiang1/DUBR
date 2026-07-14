"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";

/**
 * A modal, built on the native <dialog>.
 *
 * Not a div with a z-index. `showModal()` gives us — for free, and correctly —
 * the top layer (so nothing can ever render over it), a real backdrop, focus
 * moved into the dialog and TRAPPED there, the rest of the page marked inert, and
 * Escape to dismiss. Every one of those is a thing hand-rolled modals get wrong.
 *
 * What is left to do here is the two things the platform does not decide for you:
 * Escape should CANCEL rather than silently submit, and a click on the backdrop
 * should dismiss.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    /* The page behind a modal must not scroll under it. <dialog> does not do this
       one — it is the only piece of modal behaviour the platform leaves to you. */
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      /* Escape fires `cancel`. Prevent the default close so React stays the single
         source of truth for whether this thing is open — otherwise the dialog is
         shut in the DOM while the state that renders it still says "open", and it
         cannot be reopened. */
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      /* The <dialog> element fills the viewport; the panel inside is the visible
         box. So a click whose target IS the dialog landed on the backdrop. */
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal__panel">
        <header className="modal__head">
          <h2 className="modal__title display">{title}</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  );
}
