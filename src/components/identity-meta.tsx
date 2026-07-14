"use client";

import { useProfile } from "./profile-store";
import { PinIcon } from "./icons";
import { GENDER_LABEL, ageFrom, type Player } from "@/lib/dubr";

/**
 * The line under a player's name: where they are, how old, and which.
 *
 * It exists as its own client component for one reason — the account holder. The
 * roster is static mock data with a frozen `age`, but YOUR age comes from the
 * birthday you typed into the editor, which lives in the profile store. If this
 * line read the roster for everyone, then editing your own birthday would change
 * the number on /profile and leave /players/me disagreeing with it, which reads
 * as a bug because it is one.
 *
 * So: for you, the store wins. For everybody else, the roster is all there is.
 *
 * PHONE IS NOT HERE, and must never be. It is in the profile because a player you
 * have agreed a match with may need to reach you — that is not the same thing as
 * printing it on the page 72 strangers can scroll.
 */
export function IdentityMeta({ player, distance = false }: { player: Player; distance?: boolean }) {
  const { profile } = useProfile();
  const isMe = player.id === "me";

  const location = isMe ? profile.location : player.location;
  const gender = isMe ? profile.gender : player.gender;
  const age = isMe ? (profile.birthday ? ageFrom(profile.birthday) : null) : player.age;

  return (
    <div className="profile__meta">
      <PinIcon />
      <span>{location}</span>

      {distance && !isMe && (
        <>
          <span className="text-faint">·</span>
          <span>{player.distance} mi away</span>
        </>
      )}

      {age !== null && (
        <>
          <span className="text-faint">·</span>
          <span>{age}</span>
        </>
      )}

      <span className="text-faint">·</span>
      <span>{GENDER_LABEL[gender]}</span>
    </div>
  );
}
