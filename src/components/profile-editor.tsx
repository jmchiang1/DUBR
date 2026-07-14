"use client";

import { useRef, useState } from "react";
import { CLUBS, DAYS, HANDS, useProfile, type Profile } from "./profile-store";
import type { Day } from "@/lib/dubr";
import { PinIcon } from "./icons";

/**
 * The profile editor.
 *
 * It edits a DRAFT and only commits on Save, so Cancel genuinely abandons the
 * change — a form that writes through on every keystroke has no cancel, it just
 * has undo you have to perform by hand.
 *
 * What is editable is deliberately limited to what a player OWNS: their name,
 * where they play, which hand, when they are free. The rating, the rank, the
 * record and the match history are not editable and never will be — they are
 * earned on court, and a rating system whose subjects can type their own number
 * into it is not a rating system.
 */
export function ProfileEditor({ onDone }: { onDone: () => void }) {
  const { profile, save } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleDay = (day: Day) =>
    setDraft((d) => ({
      ...d,
      availability: d.availability.includes(day)
        ? d.availability.filter((x) => x !== day)
        : /* Keep the week in order, so Sat·Mon never renders before Mon·Sat. */
          DAYS.filter((x) => x === day || d.availability.includes(x)),
    }));

  const pickPhoto = (file: File) => {
    /* Guard the size: a data URL goes straight into localStorage, which caps out
       around 5MB. A modern phone photo blows through that and the write throws,
       silently losing the whole profile. */
    if (file.size > 1_500_000) {
      setError("That image is over 1.5MB. Pick a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      set("avatar", String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = draft.name.trim();
    if (!name) {
      setError("A name is required — other players find you by it.");
      return;
    }
    save({ ...draft, name, location: draft.location.trim() });
    onDone();
  };

  return (
    <form className="card card--pad editor rise" onSubmit={submit}>
      <div className="row row--between">
        <h2 className="display" style={{ fontSize: 20 }}>
          Edit Profile
        </h2>
      </div>

      {/* Photo */}
      <div className="editor__photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={draft.avatar} alt="" className="avatar avatar--lg" />
        <div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
            Change photo
          </button>
          {draft.avatar !== "/avatar.jpg" && (
            <button
              type="button"
              className="editor__clear"
              onClick={() => set("avatar", "/avatar.jpg")}
            >
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickPhoto(f);
              e.target.value = ""; // let the same file be picked twice
            }}
          />
        </div>
      </div>

      <label className="field-row">
        <span className="label">Display name</span>
        <input
          className="input"
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Your name"
          maxLength={40}
        />
      </label>

      <label className="field-row">
        <span className="label">Location</span>
        <div className="input input--icon">
          <PinIcon />
          <input
            value={draft.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City, State"
            maxLength={60}
          />
        </div>
      </label>

      <label className="field-row">
        <span className="label">Club</span>
        <select
          className="input"
          value={draft.club}
          onChange={(e) => set("club", e.target.value)}
        >
          {CLUBS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <span className="label">Playing hand</span>
        <div className="segmented">
          {HANDS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => set("hand", h)}
              aria-pressed={draft.hand === h}
              className={`segmented__btn ${draft.hand === h ? "is-active" : ""}`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <span className="label">Usually free to play</span>
        <div className="days">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              aria-pressed={draft.availability.includes(d)}
              className={`day ${draft.availability.includes(d) ? "is-active" : ""}`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="editor__hint">
          This is what Events and “find me a game” read. Leave it empty and you will not be
          suggested to anyone.
        </p>
      </div>

      {/* What cannot be edited, said out loud rather than left as a gap the user
          has to go hunting for. */}
      <p className="editor__locked">
        Your rating, rank, record and match history are not editable — they are earned on court.
      </p>

      {error && (
        <p className="editor__error" role="alert">
          {error}
        </p>
      )}

      <div className="editor__actions">
        <button type="button" className="btn btn--ghost" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Save changes
        </button>
      </div>
    </form>
  );
}
