"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Who you follow.
 *
 * Persisted to localStorage, like the profile store and for the same reason: a
 * follow that forgets itself the moment you navigate is not a follow. Swap
 * `load`/`persist` for the account endpoint when there is one.
 *
 * The set is the ONLY state. A follower COUNT is derived from it wherever it is
 * shown (base count + 1 if you are in it), so the number under a player's name
 * and the state of the button next to it cannot disagree.
 */

const KEY = "dubr.follows";

type Store = {
  follows: ReadonlySet<string>;
  isFollowing: (id: string) => boolean;
  toggle: (id: string) => void;
};

const FollowContext = createContext<Store | null>(null);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  /* Empty on the server AND on the first client render — reading storage during
     render would hand React markup the server never sent. */
  const [follows, setFollows] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setFollows(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* Corrupt or unavailable storage is not worth breaking the page over. */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setFollows((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      try {
        window.localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* The follow still applies in memory even if it cannot be written. */
      }
      return next;
    });
  }, []);

  const value = useMemo<Store>(
    () => ({ follows, isFollowing: (id) => follows.has(id), toggle }),
    [follows, toggle],
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

export function useFollows(): Store {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollows must be used inside <FollowProvider>");
  return ctx;
}
