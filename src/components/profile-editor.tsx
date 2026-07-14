"use client";

import { useRef, useState } from "react";
import { useProfile, type Profile } from "./profile-store";
import { LockIcon, PinIcon } from "./icons";
import { DISCIPLINES, ME, fmt, rankOf } from "@/lib/dubr";

/**
 * The profile editor.
 *
 * It edits a DRAFT and only commits on Save, so Cancel genuinely abandons the
 * change — a form that writes through on every keystroke has no cancel, it just
 * has undo you have to perform by hand.
 *
 * What is editable is deliberately limited to what a player OWNS: their photo,
 * their name, where they are. The rating, the rank, the record and the match
 * history are not editable and never will be — they are earned on court, and a
 * rating system whose subjects can type their own number into it is not a
 * rating system.
 */
export function ProfileEditor({ onDone }: { onDone: () => void }) {
  const { profile, save } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const rank = rankOf("me", "singles");

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

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
    /* No card, no heading, no `.rise` — this renders INSIDE a modal now, which
       supplies its own surface, title and entrance. */
    <form className="editor" onSubmit={submit}>
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

      {/* ── EARNED ───────────────────────────────────────────────────────
          The note under this used to name four things — rating, rank, record,
          match history — that appeared NOWHERE on the form. A sentence telling you
          what you cannot edit, next to no sign of the thing, reads as an apology
          for a missing feature: the eye goes looking for the greyed-out field and
          does not find it.

          So the numbers are here, shown for real and shown as LOCKED. Now the
          sentence is a caption for something you can see, and the form makes its
          argument instead of asserting it: this is your record, it is not a field,
          and the only way to change it is to play. */}
      <div className="earned">
        <div className="earned__head">
          <LockIcon className="earned__lock" />
          <span className="label">Earned on court</span>
        </div>

        <div className="earned__grid">
          {DISCIPLINES.map((d) => (
            <Earned key={d.id} label={d.label} value={fmt(ME[d.id])} />
          ))}
          <Earned label="Rank" value={rank ? `#${rank}` : "NR"} />
          <Earned label="Record" value={`${ME.wins}–${ME.matches - ME.wins}`} />
          <Earned label="Matches" value={String(ME.matches)} />
        </div>

        <p className="editor__hint">
          Not editable, and never will be. A rating system whose subjects can type
          their own number into it is not a rating system.
        </p>
      </div>

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

/** A number you did not type and cannot. Deliberately shaped like the fields
    above it — same label, same slot — so the contrast lands: this is what a field
    looks like when the value is not yours to set. */
function Earned({ label, value }: { label: string; value: string }) {
  return (
    <div className="earned__item">
      <div className="label">{label}</div>
      <div className="earned__value figure">{value}</div>
    </div>
  );
}
