"use client";

import { useRef, useState } from "react";
import { useProfile, type Profile } from "./profile-store";
import { LockIcon, PencilIcon, PinIcon } from "./icons";
import {
  DISCIPLINES,
  GENDER_LABEL,
  ME,
  ageFrom,
  fmt,
  rankOf,
  type Gender,
} from "@/lib/dubr";
import { DEFAULT_AVATAR } from "@/lib/asset";

/** Caps the date picker: you cannot have been born tomorrow. Computed once at
    module load — a birthday input does not need to notice midnight. */
const TODAY = new Date().toISOString().slice(0, 10);

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

    /* A birthday is optional, but a birthday that is WRONG is worse than none:
       it silently mis-sorts you into an age bracket other players filter on. */
    const birthday = draft.birthday.trim();
    if (birthday) {
      const age = ageFrom(birthday);
      if (age === null || age < 5) {
        setError("That birthday is not a real date.");
        return;
      }
    }

    save({
      ...draft,
      name,
      location: draft.location.trim(),
      birthday,
      phone: draft.phone.trim(),
    });
    onDone();
  };

  const age = draft.birthday ? ageFrom(draft.birthday) : null;

  return (
    /* No card, no heading, no `.rise` — this renders INSIDE a modal now, which
       supplies its own surface, title and entrance. */
    <form className="editor" onSubmit={submit}>
      {/* ── PHOTO ────────────────────────────────────────────────────────
          The photo IS the control. It is centred and it is the biggest thing in
          the dialog, with the pencil riding its edge — which is the gesture people
          already know from every account screen they have ever used. A "Change
          photo" button beside it was a second object doing the first object's job,
          and it made the avatar look like decoration rather than something you can
          press. The whole thing is one button, so a click anywhere on the face
          opens the picker. */}
      <div className="photo">
        <button
          type="button"
          className="photo__btn"
          onClick={() => fileRef.current?.click()}
          aria-label="Change profile photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.avatar} alt="" className="photo__img" />
          <span className="photo__badge" aria-hidden="true">
            <PencilIcon />
          </span>
        </button>

        {/* Only offered once there is something to revert TO. */}
        {draft.avatar !== DEFAULT_AVATAR && (
          <button
            type="button"
            className="editor__clear"
            onClick={() => set("avatar", DEFAULT_AVATAR)}
          >
            Remove photo
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

      {/* Birthday, not age. Age is derived and echoed back beside the field, so
          you can see the app agreed with you — and it never goes stale, which a
          typed-in age would within a year. */}
      <label className="field-row">
        <span className="label field-row__legend">
          Birthday
          {age !== null && <span className="field-row__note">{age} years old</span>}
        </span>
        <input
          className="input"
          type="date"
          value={draft.birthday}
          onChange={(e) => set("birthday", e.target.value)}
          max={TODAY}
        />
      </label>

      <div className="field-row">
        <span className="label">Gender</span>
        <div className="segmented" role="group" aria-label="Gender">
          {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set("gender", g)}
              aria-pressed={draft.gender === g}
              className={`segmented__btn ${draft.gender === g ? "is-active" : ""}`}
            >
              {GENDER_LABEL[g]}
            </button>
          ))}
        </div>
      </div>

      {/* PRIVATE, and it says so. A phone number on a screen full of public fields
          will be assumed public unless the form says otherwise — and by the time a
          player discovers otherwise, it is already on 72 strangers' screens. */}
      <label className="field-row">
        <span className="label field-row__legend">
          Phone
          <span className="field-row__private">
            <LockIcon />
            Private
          </span>
        </span>
        <input
          className="input"
          type="tel"
          value={draft.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="(555) 123-4567"
          maxLength={24}
        />
        <p className="editor__hint">
          Never shown on your public profile. Only a player you have agreed a match
          with can see it.
        </p>
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
