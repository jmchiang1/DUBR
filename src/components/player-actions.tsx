"use client";

import Link from "next/link";
import { useFollows } from "./follow-store";
import { FollowIcon, FollowingIcon, MessageIcon, PlusIcon } from "./icons";

/**
 * What you can DO about a player, on its own row under their header.
 *
 * These three were crammed into the identity card, which had to be an identity, a
 * stat block and a toolbar all at once — and the toolbar won, squeezing the name
 * to an ellipsis. A card should say who somebody IS. What you do about them is a
 * separate thought and now gets a separate line.
 *
 * The order is the order of commitment, cheapest first: follow them (costs
 * nothing), message them (costs a sentence), log a match (means you actually
 * played). Message is the one carrying the aqua — it is the action that turns this
 * page into a game, which is the entire reason anybody opens a stranger's profile.
 * Follow is the more frequent click, but frequency is not importance, and aqua in
 * this app is scarce on purpose.
 */
export function PlayerActions({ playerId, firstName }: { playerId: string; firstName: string }) {
  const { isFollowing, toggle } = useFollows();
  const followed = isFollowing(playerId);

  return (
    <div className="actions rise" style={{ animationDelay: "40ms" }}>
      <button
        onClick={() => toggle(playerId)}
        aria-pressed={followed}
        className={`btn actions__btn ${followed ? "btn--ghost is-following" : "btn--ghost"}`}
      >
        {followed ? <FollowingIcon /> : <FollowIcon />}
        {followed ? "Following" : "Follow"}
      </button>

      <Link href="/messages" className="btn btn--primary actions__btn">
        <MessageIcon />
        Message
      </Link>

      <Link href="/log" className="btn btn--ghost actions__btn">
        <PlusIcon />
        {/* Named for the person, because that is what you are about to do — log a
            match WITH them, not open a blank form. */}
        Log a match with {firstName}
      </Link>
    </div>
  );
}
