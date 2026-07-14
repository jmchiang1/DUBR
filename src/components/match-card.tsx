"use client";

import { ArrowUpIcon, ArrowDownIcon, PinIcon } from "./icons";
import { Avatar } from "./shell";
import { fmtDelta, type Match, type MatchSide, type MatchPlayer } from "@/lib/dubr";

/**
 * A match card. Styling lives in styles/components.css under `.match`.
 *
 * A match reprices every player on court, so all of them are listed with the
 * rating they carried in and the direction it moved.
 */
export function MatchCard({ match }: { match: Match }) {
  const up = match.delta >= 0;

  return (
    <article className="card match">
      <div className="match__top">
        <span className={`result-pill ${match.won ? "is-win" : "is-loss"}`}>
          {match.won ? "Win" : "Loss"}
        </span>

        <span className={`delta delta--bare ${up ? "is-up" : "is-down"}`}>
          {fmtDelta(match.delta)}
          {up ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </span>
      </div>

      <h3 className="match__event">{match.event}</h3>
      <div className="match__meta">
        <span>{match.date}</span>
        <span>•</span>
        <PinIcon />
        <span>{match.location}</span>
      </div>

      <div className="match__sides">
        <Side side={match.mine} winner={match.won} />
        <Side side={match.theirs} winner={!match.won} />
      </div>
    </article>
  );
}

function Side({ side, winner }: { side: MatchSide; winner: boolean }) {
  return (
    <div className="match__side">
      <ul className="match__players">
        {side.players.map((p) => (
          <PlayerRow key={p.name} player={p} />
        ))}
      </ul>

      <div className="match__scores">
        <div className="scores">
          {side.games.map((g, i) => (
            <span key={i} className={`score figure ${winner ? "is-winner" : ""}`}>
              {g}
            </span>
          ))}
        </div>

        {/* The caret marks the winner. Colour is already carrying rating
            movement here, so the win is marked by a shape instead. */}
        <span className="caret">
          {winner && (
            <svg viewBox="0 0 8 10" role="img" aria-label="Winner">
              <path d="M8 5 0 10V0z" />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
}

/** "Sarah Tanaka" → "ST". */
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function PlayerRow({ player }: { player: MatchPlayer }) {
  const up = player.delta >= 0;

  return (
    <li className="player">
      {/* Only the account holder has a photo. Reusing the one avatar asset for
          everybody made every player on court the same person. */}
      {player.me ? (
        <Avatar className="avatar avatar--sm" />
      ) : (
        <span className="avatar-initials">{initials(player.name)}</span>
      )}

      <span className={`player__name ${player.me ? "is-me" : ""}`}>{player.name}</span>

      <span className={`player__rating ${up ? "is-up" : "is-down"}`}>
        {player.rating === null ? "NR" : player.rating.toFixed(3)}
        {up ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </span>
    </li>
  );
}
