"use client";

import { ArrowUpIcon, ArrowDownIcon, PinIcon } from "./icons";
import { Avatar } from "./shell";
import { fmtDelta, type PendingMatch, type MatchSide, type MatchPlayer } from "@/lib/dubr";

/**
 * A match somebody else logged, waiting on your confirmation.
 *
 * It is a match card with a decision attached, and the decision is only fair if
 * you can see what it costs you BEFORE you make it — so the projected rating
 * change is stated on the card, not revealed after you accept.
 *
 * Dispute is a real button, not a smaller one. A confirmation flow where the
 * agreeable answer is easy and the disagreeable answer is hidden is not a
 * confirmation flow, it is a nudge — and a rating moved by a nudge is worth
 * nothing.
 */
export function PendingCard({
  match: m,
  onResolve,
}: {
  match: PendingMatch;
  onResolve: (action: "confirm" | "dispute") => void;
}) {
  const up = m.projected >= 0;

  return (
    <article className="card match match--pending">
      <div className="match__top">
        <span className="result-pill is-pending">Awaiting you</span>
        <span className={`delta delta--bare ${up ? "is-up" : "is-down"}`}>
          {fmtDelta(m.projected)}
          {up ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </span>
      </div>

      <h3 className="match__event">{m.event}</h3>
      <div className="match__meta">
        <span>{m.date}</span>
        <span>•</span>
        <PinIcon />
        <span>{m.location}</span>
      </div>

      <div className="match__sides">
        <Side side={m.mine} winner={m.won} />
        <Side side={m.theirs} winner={!m.won} />
      </div>

      <p className="match__logged">
        Logged by <strong>{m.loggedBy}</strong>. Your rating does not move until you confirm.
      </p>

      <div className="match__actions">
        <button className="btn btn--ghost btn--sm" onClick={() => onResolve("dispute")}>
          Dispute
        </button>
        <button className="btn btn--primary btn--sm" onClick={() => onResolve("confirm")}>
          Confirm result
        </button>
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
