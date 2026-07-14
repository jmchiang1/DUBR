"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileEditor } from "@/components/profile-editor";
import { Modal } from "@/components/modal";
import { useProfile } from "@/components/profile-store";
import { PendingCard } from "@/components/pending-card";
import {
  ChevronIcon,
  PinIcon,
  PencilIcon,
  CalendarIcon,
  ShuttleIcon,
  CopyIcon,
} from "@/components/icons";
import {
  ME,
  PENDING,
  DISCIPLINES,
  RELIABILITY_THRESHOLD,
  fmt,
  type PendingMatch,
} from "@/lib/dubr";
import { myEvents, KIND_LABEL } from "@/lib/events";

const DUBR_ID = "X22V02";

const MENU = [
  { label: "Rating history", sub: "Every match, every delta", href: "/log" },
  { label: "How DUBR works", sub: "What moves your number, and why", href: "#" },
  { label: "Notifications", sub: "Match confirmations, event reminders", href: "#" },
  { label: "Privacy", sub: "Who can log a match with you", href: "#" },
];

/**
 * /profile is your ACCOUNT — not a second dashboard.
 *
 * Home already carries the rating, the trajectory and the statistics, and
 * /players/me is the public page other players see. A third copy of the same
 * numbers here would be the third view of one thing. So this page holds only
 * what the other two cannot:
 *
 *   1. Matches waiting on YOU. The log screen promises "your opponent confirms
 *      it, then both ratings move" — this is where that promise is kept. It was
 *      previously nowhere, which meant a score you never agreed to could move
 *      your rating.
 *   2. What you are signed up for. /events shows what exists; home shows what
 *      already happened. What you are committed to NEXT had no home.
 *   3. How settled each rating is, and what would settle it — the confidence
 *      behind the number, which home states without explaining.
 *   4. Your DUBR ID, and the account settings.
 */
export default function Profile() {
  const { profile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<PendingMatch[]>(PENDING);
  const [copied, setCopied] = useState(false);

  const events = myEvents();

  const resolve = (id: string) => setPending((ps) => ps.filter((p) => p.id !== id));

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(DUBR_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard is permission-gated and can simply refuse. The ID is on screen
         either way, so there is nothing to recover from. */
    }
  };

  return (
    <div className="stack">
      {/* The editor is a MODAL over this page, not a page of its own. Editing your
          own name is a two-field errand — swapping the whole screen out for it lost
          you your place, and the page you came back to looked like a navigation
          rather than a save. The dialog also owns the "am I editing" question
          outright: it is either up or it is not. */}
      {editing && (
        <Modal title="Edit profile" onClose={() => setEditing(false)}>
          <ProfileEditor onDone={() => setEditing(false)} />
        </Modal>
      )}
      {/* ── IDENTITY ────────────────────────────────────────────────────── */}
      <header className="card profile rise">
        <div className="profile__id">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt="" className="avatar avatar--lg" />

          <div style={{ minWidth: 0 }}>
            <h1 className="profile__name display">{profile.name}</h1>
            <div className="profile__meta">
              <PinIcon />
              <span>{profile.location}</span>
            </div>
          </div>
        </div>

        <div className="profile__social">
          {/* The ID is how another player adds you at a court, with no search and
              no spelling of your name. It is the one string worth copying. */}
          <button className="id-chip" onClick={copyId} aria-label={`Copy DUBR ID ${DUBR_ID}`}>
            <span className="label">DUBR ID</span>
            <span className="id-chip__value">{copied ? "Copied" : DUBR_ID}</span>
            <CopyIcon />
          </button>

          <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
            <PencilIcon />
            Edit profile
          </button>
        </div>
      </header>

      {/* ── 1. WAITING ON YOU ────────────────────────────────────────────
             The other half of the log flow. Ranked first because it is the only
             thing on this page with a deadline attached to it. */}
      <section className="rise" style={{ animationDelay: "40ms" }}>
        <div className="row row--between" style={{ marginBottom: 12, padding: "0 4px" }}>
          <h2 className="card__title display">Waiting On You</h2>
          {pending.length > 0 && <span className="count-pill">{pending.length}</span>}
        </div>

        {pending.length === 0 ? (
          <p className="card empty">
            Nothing to confirm. Matches logged against you land here first — your rating never
            moves on a score you have not agreed to.
          </p>
        ) : (
          <div className="grid-cards">
            {pending.map((m) => (
              <PendingCard key={m.id} match={m} onResolve={() => resolve(m.id)} />
            ))}
          </div>
        )}
      </section>

      <div className="split">
        {/* ── 2. RATING CONFIDENCE ───────────────────────────────────────
               Home prints the number. This says how much to trust it, and what
               would make it more trustworthy — which is the question a player
               with 14 matches actually has. */}
        <section className="card card--pad rise" style={{ animationDelay: "80ms" }}>
          <h2 className="display" style={{ fontSize: 20 }}>
            Rating
          </h2>

          <ul className="conf">
            {DISCIPLINES.map((d) => {
              const v = ME[d.id];
              const rated = v !== null;
              const pct = rated ? Math.round(ME.reliability * 100) : 0;
              const need = RELIABILITY_THRESHOLD - ME.matches;

              return (
                <li key={d.id} className="conf__row">
                  <div className="conf__head">
                    <span className="conf__name">{d.label}</span>
                    <span className={`conf__value figure ${rated ? "" : "text-faint"}`}>
                      {fmt(v)}
                    </span>
                  </div>

                  <div className="conf__bar">
                    <div className="conf__fill" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="conf__sub">
                    {rated
                      ? `${pct}% settled — ${
                          pct >= 80
                            ? "tournament-ready"
                            : "a few more matches will tighten this"
                        }`
                      : `Unrated — ${Math.max(need, 1)} more ${
                          Math.max(need, 1) === 1 ? "match" : "matches"
                        } to place you on the scale`}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="filters__note" style={{ marginTop: 16 }}>
            Confidence rises with matches played and with how varied your opponents are. Beating
            the same partner ten times moves it less than ten different opponents would.
          </p>
        </section>

        {/* ── 3. WHAT YOU ARE SIGNED UP FOR ─────────────────────────────── */}
        <section className="card card--pad rise" style={{ animationDelay: "120ms" }}>
          <div className="row row--between">
            <h2 className="display" style={{ fontSize: 20 }}>
              Your Events
            </h2>
            <Link href="/events" className="card__link">
              Browse
              <ChevronIcon />
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="empty" style={{ padding: "24px 0" }}>
              You have not registered for anything yet.
            </p>
          ) : (
            <ul className="reg">
              {events.map((e) => (
                <li key={e.id} className="reg__row">
                  <span className="reg__icon">
                    <CalendarIcon />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="reg__name">{e.name}</div>
                    <div className="reg__meta">
                      {e.host} · {e.when}
                    </div>
                  </div>
                  <span className={`event__kind is-${e.kind}`}>{KIND_LABEL[e.kind]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── 4. ACCOUNT ──────────────────────────────────────────────────── */}
      <section className="card rise" style={{ animationDelay: "160ms", overflow: "hidden" }}>
        <ul>
          <li>
            {/* Your public page already exists. Say so, rather than rebuilding it
                here for a third time. */}
            <Link href="/players/me" className="menu__item">
              <span className="reg__icon">
                <ShuttleIcon />
              </span>
              <div className="menu__body">
                <div className="menu__label">View public profile</div>
                <div className="menu__sub">How other players see you</div>
              </div>
              <ChevronIcon />
            </Link>
          </li>

          {MENU.map((m) => (
            <li key={m.label}>
              <Link href={m.href} className="menu__item">
                <div className="menu__body">
                  <div className="menu__label">{m.label}</div>
                  <div className="menu__sub">{m.sub}</div>
                </div>
                <ChevronIcon />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button className="btn btn--ghost btn--block">Sign out</button>
    </div>
  );
}
