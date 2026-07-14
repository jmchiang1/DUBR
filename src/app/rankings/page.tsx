"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronIcon, SearchIcon } from "@/components/icons";
import {
  DISCIPLINES,
  type Discipline,
  board,
  pageOf,
  PAGE_SIZE,
  fmt,
} from "@/lib/dubr";

export default function Rankings() {
  const [disc, setDisc] = useState<Discipline>("singles");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const all = useMemo(() => board(disc), [disc]);

  /* Search NARROWS the board, it does not re-rank it: every row keeps the rank it
     holds on the FULL board, so searching your own name shows you at #31, not at
     #1 of a list of one. A rank that changes with the query is not a rank. */
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? all.filter((r) => r.player.name.toLowerCase().includes(term)) : all;
  }, [all, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  /* The summary is a fact about the BOARD, not about your query — it reads from
     `all`. Computed from the filtered rows, "Top DUBR" would mean "the best of the
     three people whose name contains 'zh'", which is not a statistic. */
  const ratedRows = all.filter((r) => r.rank !== null);
  const top = ratedRows[0]?.player[disc] as number;
  const avg =
    ratedRows.reduce((s, r) => s + (r.player[disc] as number), 0) / (ratedRows.length || 1);
  const totalMatches = all.reduce((s, r) => s + r.player.matches, 0);

  const myPage = pageOf(rows, "me");
  const onMyPage = current === myPage;

  const go = (n: number) => {
    setPage(Math.min(Math.max(1, n), pages));
    /* A paginated list that leaves you at the bottom of the previous page makes
       you scroll up to read the new one. */
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="stack--tight stack">
      <header className="page-head rise">
        <h1 className="page-title display">Rankings</h1>
      </header>

      <div className="searchbar rise" style={{ maxWidth: 520 }}>
        <SearchIcon className="search__icon" />
        <input
          className="search__input"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1); // the result of a new query is never on page 4 of the old one
          }}
          placeholder="Search the board"
          aria-label="Search the board"
        />
      </div>

      <div className="tabs rise" style={{ animationDelay: "40ms" }}>
        {DISCIPLINES.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setDisc(d.id);
              setPage(1); // a player's rank differs per discipline; page 1 is the only safe landing
            }}
            aria-pressed={d.id === disc}
            className={`tab ${d.id === disc ? "is-active" : ""}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <section
        className="card card--pad rise"
        style={{ animationDelay: "80ms", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}
      >
        <Summary label="Top DUBR" value={top?.toFixed(3) ?? "—"} />
        <Summary label="Average" value={avg.toFixed(3)} />
        <Summary label="Matches" value={String(totalMatches)} />
      </section>

      {rows.length === 0 && <p className="card empty">Nobody on the board is called “{q}”.</p>}

      {/* ── ONE table. Rated and unrated players together — an unrated player is
             still a member of the club, and hiding them in a separate section
             below the fold made them easy to miss. They are listed without a
             rank, because a rank is a claim DUBR has not earned the right to
             make about them yet. ─────────────────────────────────────────── */}
      <section
        className="card rise"
        style={{ animationDelay: "120ms", overflow: "hidden", display: rows.length ? "" : "none" }}
      >
        <div className="board__head">
          <div className="label board__rank">#</div>
          <div className="label board__player" style={{ paddingLeft: 42 }}>
            Player
          </div>
          <div className="label board__record">Record</div>
          <div className="label board__rating">Rating</div>
        </div>

        <ul>
          {slice.map(({ player: p, rank }) => {
            const me = p.id === "me";
            const rated = rank !== null;
            return (
              <li key={p.id}>
                <Link href={`/players/${p.id}`} className={`board__row ${me ? "is-me" : ""}`}>
                  <div className={`board__rank figure ${rank !== null && rank <= 3 ? "is-top" : ""}`}>
                    {rank ?? <span className="board__norank">—</span>}
                  </div>

                  <span
                    className={`avatar-initials avatar-initials--lg ${rated ? "" : "is-provisional"}`}
                  >
                    {p.initials}
                  </span>

                  <div className="board__player">
                    <div className={`board__name ${rated ? "" : "text-mute"}`}>
                      <span>{p.name}</span>
                      {me && <span className="badge-you label">You</span>}
                    </div>
                    <div className="board__sub">
                      {rated
                        ? `${p.matches} matches · ${Math.round((p.wins / p.matches) * 100)}% W`
                        : `Unrated · ${p.matches} of 5 matches logged`}
                    </div>
                  </div>

                  <div className="board__record">
                    {rated ? `${p.wins}–${p.matches - p.wins}` : ""}
                  </div>

                  <div className={`board__rating figure ${rated ? "" : "is-unrated"}`}>
                    {fmt(p[disc])}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <nav className="pager rise" aria-label="Rankings pages" style={{ animationDelay: "160ms" }}>
        <span className="pager__count">
          {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} of{" "}
          {rows.length}
        </span>

        <div className="pager__controls">
          {/* A board you cannot find yourself on is a board you stop opening. */}
          {!onMyPage && (
            <button className="pager__me" onClick={() => go(myPage)}>
              Find me
            </button>
          )}

          <button
            className="pager__btn"
            onClick={() => go(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
          >
            <ChevronIcon />
          </button>

          {pageNumbers(current, pages).map((n, i) =>
            n === null ? (
              <span key={`gap${i}`} className="pager__gap">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => go(n)}
                aria-current={n === current ? "page" : undefined}
                className={`pager__btn ${n === current ? "is-active" : ""}`}
              >
                {n}
              </button>
            ),
          )}

          <button
            className="pager__btn pager__btn--next"
            onClick={() => go(current + 1)}
            disabled={current === pages}
            aria-label="Next page"
          >
            <ChevronIcon />
          </button>
        </div>
      </nav>
    </div>
  );
}

/**
 * Page numbers with an ellipsis, so the control stays a fixed width whether the
 * board has 3 pages or 300. `null` is a gap.
 */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const out: (number | null)[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);

  if (from > 2) out.push(null);
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push(null);

  out.push(total);
  return out;
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="stat__value figure" style={{ fontSize: 20 }}>
        {value}
      </div>
    </div>
  );
}
