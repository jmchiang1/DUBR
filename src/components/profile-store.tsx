"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ME, DAYS, type Day } from "@/lib/dubr";

/**
 * The player's own profile, shared by the rail, the home header, and /profile.
 *
 * Unlike the messages mock, this one PERSISTS: an "edit profile" that forgets
 * what you typed the moment you navigate is not an edit feature. It writes to
 * localStorage, which is the honest stand-in for the account endpoint that does
 * not exist yet — swap `load`/`persist` for fetch calls and nothing else moves.
 */

export const CLUBS = ["Kotofit LIC", "Kotofit Flushing", "Kotofit JC", "No club"] as const;
export const HANDS = ["Right", "Left"] as const;

/* DAYS is re-exported from the data layer rather than redeclared here. Your
   availability and a roster player's `days` are the same field — "find me a
   game" has to read the same seven strings on both sides of the match, and two
   independent lists would eventually drift. */
export { DAYS };

export type Profile = {
  name: string;
  location: string;
  club: string;
  hand: (typeof HANDS)[number];
  /** Days you are usually free to play — this is what "find me a game" reads. */
  availability: Day[];
  /** A data URL when the user has picked their own photo, else the default. */
  avatar: string;
};

const DEFAULTS: Profile = {
  name: ME.name,
  location: ME.location,
  /* A club is no longer part of a PLAYER — a facility is a fact about a building,
     not about a person, so it came off every player bio. It survives here as one
     of YOUR OWN settings, which is a different thing: a preference you set, not a
     label the directory hangs on you. Nobody else's club is shown anywhere. */
  club: CLUBS[0],
  hand: "Right",
  availability: ["Tue", "Thu", "Sat"],
  avatar: "/avatar.jpg",
};

const KEY = "dubr.profile";

type Store = {
  profile: Profile;
  save: (next: Profile) => void;
  reset: () => void;
};

const ProfileContext = createContext<Store | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  /* Start from DEFAULTS on BOTH the server and the first client render, then
     load in an effect. Reading localStorage during render would produce markup
     that does not match what the server sent, and React would throw a hydration
     mismatch — the stored name against the default one. */
  const [profile, setProfile] = useState<Profile>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setProfile({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Profile>) });
    } catch {
      /* Corrupt or unavailable storage (private mode, quota) is not worth
         breaking the app over — fall back to the defaults. */
    }
  }, []);

  const save = useCallback((next: Profile) => {
    setProfile(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* The edit still applies in memory even if it cannot be written. */
    }
  }, []);

  const reset = useCallback(() => {
    setProfile(DEFAULTS);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nothing to undo */
    }
  }, []);

  const value = useMemo(() => ({ profile, save, reset }), [profile, save, reset]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): Store {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
