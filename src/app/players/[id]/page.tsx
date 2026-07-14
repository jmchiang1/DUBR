import Link from "next/link";
import { notFound } from "next/navigation";
import { Trend } from "@/components/trend-chart";
import { MatchCard } from "@/components/match-card";
import { ChevronIcon } from "@/components/icons";
import { IdentityMeta } from "@/components/identity-meta";
import { PlayerSocial } from "@/components/player-social";
import { PlayerActions } from "@/components/player-actions";
import {
  ROSTER,
  ME,
  DISCIPLINES,
  getPlayer,
  rankOf,
  syntheticHistory,
  matchesFor,
  headToHead,
  socialFor,
  fmt,
  RELIABILITY_THRESHOLD,
} from "@/lib/dubr";

/** Every player is a static route — the roster is known at build time. */
export function generateStaticParams() {
  return ROSTER.map((p) => ({ id: p.id }));
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();

  const isMe = player.id === "me";
  const rating = player.singles;
  const rated = rating !== null;
  const rank = rankOf(player.id, "singles");
  const { followers, following } = socialFor(player);
  const history = syntheticHistory(player, "singles");
  const matches = matchesFor(player);
  const h2h = isMe ? null : headToHead(player);
  const losses = player.matches - player.wins;

  return (
    <div className="stack">
      {/* Where you came from. A detail page reached from a board needs a way
          back to it that is not the browser button. */}
      <Link href="/rankings" className="backlink">
        <ChevronIcon />
        Rankings
      </Link>

      {/* ── IDENTITY ────────────────────────────────────────────────────── */}
      <header className="card profile rise">
        <div className="profile__id">
          <span className={`avatar-initials avatar-initials--xl ${rated ? "" : "is-provisional"}`}>
            {player.initials}
          </span>

          <div style={{ minWidth: 0 }}>
            <h1 className="profile__name display">{player.name}</h1>
            {/* No club: which facility somebody prefers to book is a fact about a
                building, not about them. Age and gender ARE about them, and both
                are things the directory already lets you filter on — a filter you
                cannot then read off the profile is a filter you cannot trust. */}
            <IdentityMeta player={player} distance />
          </div>
        </div>

        {/* The same two numbers your own header carries, in the same place, and
            NOTHING else. The card says who somebody is; what you do about them is
            a separate thought, and it is on its own row below. */}
        <div className="profile__social">
          <PlayerSocial playerId={player.id} followers={followers} following={following} />
        </div>
      </header>

      {/* You cannot follow, message or play yourself, so your own page has no
          action row at all — and does not need one: it has Edit profile. */}
      {!isMe && <PlayerActions playerId={player.id} firstName={player.name.split(" ")[0]} />}

      <div className="split">
        {/* ── RATING ────────────────────────────────────────────────────── */}
        <section className="card rating-card rise" style={{ animationDelay: "60ms" }}>
          <div className="disciplines">
            {DISCIPLINES.map((d) => (
              <div key={d.id} className={`discipline ${d.id === "singles" ? "is-active" : ""}`}>
                <div className="label">{d.label}</div>
                <div className="discipline__value">{fmt(player[d.id])}</div>
              </div>
            ))}
          </div>

          <div className="rating">
            <div className="label">Singles Rating</div>

            <div className="rating__row">
              <div className={`rating__figure figure ${rated ? "" : "text-faint"}`}>
                {fmt(rating)}
              </div>
            </div>

            {rated ? (
              <>
                {rank && <div className="rating__level">#{rank} in singles</div>}

                <div className="chart">
                  <div className="label">Rating Trajectory</div>
                  <Trend points={history} interactive delay={260} className="chart__canvas" />
                  <div className="chart__foot">
                    <span className="chart__span">
                      {history.length} {history.length === 1 ? "match" : "matches"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Honest empty state, same as everywhere else: an unrated player is
                 unrated, not secretly a 5.500. */
              <div className="rating__empty">
                {player.name.split(" ")[0]} is not rated yet — {player.matches} of{" "}
                {RELIABILITY_THRESHOLD} matches logged. DUBR places a player on the scale once
                there is enough evidence to mean something.
              </div>
            )}
          </div>
        </section>

        {/* ── STATISTICS ────────────────────────────────────────────────── */}
        <section className="card card--pad rise" style={{ animationDelay: "100ms" }}>
          <h2 className="display" style={{ fontSize: 24 }}>
            Statistics
          </h2>

          <div className="stat-grid" style={{ marginTop: 24 }}>
            <Stat label="Matches" value={String(player.matches)} />
            <Stat
              label="Win Rate"
              value={player.matches ? `${Math.round((player.wins / player.matches) * 100)}%` : "—"}
            />
            <Stat label="Wins" value={String(player.wins)} />
            <Stat label="Losses" value={String(losses)} />
            <Stat label="Global Rank" value={rank ? `#${rank}` : "NR"} sub="singles" />
            <Stat
              label="Reliability"
              value={`${Math.round(player.reliability * 100)}%`}
              sub={player.reliability < 0.6 ? "still settling" : "settled"}
            />
          </div>

          {/* Head-to-head. The one statistic on this page that is about YOU and
              them rather than about them — which is the reason you opened it. */}
          {h2h && (
            <div className="stat-grid stat-grid--divided">
              <Stat
                label="Head to Head"
                value={h2h.wins + h2h.losses === 0 ? "—" : `${h2h.wins}–${h2h.losses}`}
                sub={
                  h2h.wins + h2h.losses === 0
                    ? "never played"
                    : `your record vs ${player.name.split(" ")[0]}`
                }
              />
              <Stat
                label="Rating Gap"
                value={
                  rated && ME.singles !== null
                    ? `${rating > ME.singles ? "+" : ""}${(rating - ME.singles).toFixed(3)}`
                    : "—"
                }
                sub={rated && ME.singles !== null && rating > ME.singles ? "above you" : "below you"}
              />
            </div>
          )}
        </section>
      </div>

      {/* ── MATCHES ─────────────────────────────────────────────────────── */}
      <section className="rise" style={{ animationDelay: "140ms" }}>
        <div className="row row--between" style={{ marginBottom: 12, padding: "0 4px" }}>
          <h2 className="card__title display">
            {isMe ? "Recent Matches" : `Matches with ${player.name.split(" ")[0]}`}
          </h2>
        </div>

        {matches.length === 0 ? (
          <p className="card empty">
            You have not played {player.name.split(" ")[0]} yet.
          </p>
        ) : (
          <div className="grid-cards">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="stat__value figure">{value}</div>
      {sub && <div className="stat__sub">{sub}</div>}
    </div>
  );
}
