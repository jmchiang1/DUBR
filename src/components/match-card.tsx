import { ArrowUpIcon, ArrowDownIcon, PinIcon } from "./icons";
import { fmtDelta, type Match, type MatchSide, type MatchPlayer } from "@/lib/dubr";

/**
 * A match card, per the DUPR pattern.
 *
 * The point of the layout: a match reprices EVERY player on court, so all four
 * are listed with the rating they carried in and the direction it moved. The
 * previous row-per-match only showed the account holder's delta, which quietly
 * hid the thing the product actually does.
 *
 * The winning side is marked by a caret against its score rather than by
 * colouring the row — colour is already spent on rating movement here, and a
 * second colour code competing with it would make neither legible.
 */
export function MatchCard({ match }: { match: Match }) {
  return (
    <article className="rounded-[14px] bg-surface px-4 py-4 lg:px-5">
      {/* Result + the account holder's own delta. */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            match.won ? "bg-aqua text-on-aqua" : "bg-loss/20 text-loss"
          }`}
        >
          {match.won ? "Win" : "Loss"}
        </span>

        <span
          className={`flex items-center gap-1 text-[13px] font-semibold tabular-nums ${
            match.delta >= 0 ? "text-aqua" : "text-loss"
          }`}
        >
          {fmtDelta(match.delta)}
          {match.delta >= 0 ? (
            <ArrowUpIcon className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </div>

      <h3 className="mt-3 text-[15px] leading-snug font-semibold text-bone lg:text-[16px]">
        {match.event}
      </h3>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-faint">
        <span className="tabular-nums">{match.date}</span>
        <span>•</span>
        <PinIcon className="h-3 w-3 shrink-0" />
        <span className="truncate">{match.location}</span>
      </div>

      <div className="mt-4 space-y-3">
        <Side side={match.mine} winner={match.won} />
        <Side side={match.theirs} winner={!match.won} />
      </div>
    </article>
  );
}

function Side({ side, winner }: { side: MatchSide; winner: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <ul className="min-w-0 flex-1 space-y-1.5">
        {side.players.map((p) => (
          <PlayerRow key={p.name} player={p} />
        ))}
      </ul>

      {/* Scores. The caret points at the side that won — one mark, no colour. */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex gap-2">
          {side.games.map((g, i) => (
            <span
              key={i}
              className={`w-[22px] text-right text-[15px] tabular-nums ${
                winner ? "font-semibold text-bone" : "text-faint"
              }`}
            >
              {g}
            </span>
          ))}
        </div>
        <span className="w-2 shrink-0">
          {winner && (
            <svg viewBox="0 0 8 10" className="h-2.5 w-2 fill-aqua" aria-label="Winner">
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
    <li className="flex min-w-0 items-center gap-2">
      {/* Only the account holder has a photo. Everyone else gets initials —
          reusing the one avatar asset for all four made every player on court
          the same person. */}
      {player.me ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/avatar.jpg"
          alt=""
          className="h-6 w-6 shrink-0 rounded-full object-cover object-[50%_22%] ring-2 ring-aqua"
        />
      ) : (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-elevated text-[9px] font-semibold text-mute">
          {initials(player.name)}
        </span>
      )}

      <span
        className={`min-w-0 truncate text-[13px] ${
          player.me ? "font-semibold text-bone" : "text-mute"
        }`}
      >
        {player.name}
      </span>

      {/* The rating they carried in, and which way this match moved it. */}
      <span
        className={`flex shrink-0 items-center gap-0.5 text-[13px] tabular-nums ${
          up ? "text-aqua" : "text-loss"
        }`}
      >
        {player.rating === null ? "NR" : player.rating.toFixed(3)}
        {up ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
      </span>
    </li>
  );
}
