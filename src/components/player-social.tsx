"use client";

import { useFollows } from "./follow-store";

/**
 * The two numbers on the right of a profile header: following, followers.
 *
 * The SAME block on every profile — yours and anybody else's — because a player's
 * page and your page are the same page seen from two sides, and a stat that moves
 * around depending on whose page you are on is a stat you have to hunt for.
 *
 * It carries nothing else. The header used to hold Follow, Message and Log a match
 * as well, and three buttons plus two stats plus an identity in one row left the
 * name so little space that "Mecream Osathanugrah" rendered as "MECRE…". The
 * actions moved out to their own row — see <PlayerActions>.
 *
 * It still reads the follow store, though, because a follower count is not a static
 * fact: following somebody and then watching their follower count sit there unmoved
 * is the kind of small lie that makes a whole page feel fake. The count shown is the
 * base plus you, derived from the same set the Follow button toggles.
 */
export function PlayerSocial({
  playerId,
  followers,
  following,
}: {
  playerId: string;
  followers: number;
  following: number;
}) {
  const { isFollowing } = useFollows();
  const followed = isFollowing(playerId);

  return (
    <>
      <div className="social">
        <span className="social__value figure">{following}</span>
        <span className="label">Following</span>
      </div>

      <div className="social">
        <span className="social__value figure">{followers + (followed ? 1 : 0)}</span>
        <span className="label">Followers</span>
      </div>
    </>
  );
}
