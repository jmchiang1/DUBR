"use client";

import { useMemo, useState } from "react";
import { PLAYERS, DISCIPLINES, fmt, levelFor } from "@/lib/dubr";
import { SearchIcon, PinIcon } from "@/components/icons";

export default function Players() {
  const [q, setQ] = useState("");
  /** Off by default. "Near my level" is the query that actually gets someone a
      game — the old app made you scroll a directory and guess. */
  const [nearMe, setNearMe] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PLAYERS.filter((p) => p.id !== "me")
      .filter((p) => !term || p.name.toLowerCase().includes(term))
      .filter((p) => {
        if (!nearMe) return true;
        const r = p.singles;
        return r !== null && Math.abs(r - 5.302) <= 0.35;
      });
  }, [q, nearMe]);

  return (
    <div className="space-y-3">
      <header className="rise">
        <h1 className="display text-[26px]">Players</h1>
        <p className="mt-1.5 text-[13px] text-mute">
          A close match makes a better game — and moves your rating more.
        </p>
      </header>

      <div className="rise flex gap-2" style={{ animationDelay: "40ms" }}>
        <div className="flex flex-1 items-center gap-2.5 rounded-[8px] border border-line/70 bg-surface px-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players"
            aria-label="Search players"
            className="w-full bg-transparent py-2.5 text-[13px] text-bone outline-none placeholder:text-faint"
          />
        </div>
        <button
          onClick={() => setNearMe((v) => !v)}
          aria-pressed={nearMe}
          className={`shrink-0 rounded-[8px] border px-3 text-[12px] font-medium transition-colors ${
            nearMe
              ? "border-aqua bg-aqua text-on-aqua"
              : "border-line/70 bg-surface text-mute hover:text-bone"
          }`}
        >
          Near my level
        </button>
      </div>

      <section
        className="rise overflow-hidden rounded-[14px] border border-line/60 bg-surface"
        style={{ animationDelay: "80ms" }}
      >
        {results.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-faint">
            No players match “{q}”.
          </p>
        ) : (
          <ul className="divide-y divide-line/40">
            {results.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-elevated/40"
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[12px] font-semibold ${
                    p.singles === null
                      ? "border-dashed border-line bg-ink text-faint"
                      : "border-line bg-elevated text-mute"
                  }`}
                >
                  {p.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-bone">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-faint">
                    <PinIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.club ?? p.location}</span>
                  </div>
                </div>

                {/* All three discipline ratings, always — a doubles specialist
                    and a singles specialist are different players, and hiding
                    two of the three numbers hides that. */}
                <div className="flex shrink-0 gap-px overflow-hidden rounded-[8px] border border-line/70">
                  {DISCIPLINES.map((d) => {
                    const v = p[d.id];
                    return (
                      <div
                        key={d.id}
                        className="bg-elevated px-2 py-1.5 text-center"
                        title={`${d.label}: ${fmt(v)}`}
                      >
                        <div className="label !text-[8px]">{d.label.slice(0, 1)}</div>
                        <div
                          className={`mt-1 text-[12px] tabular-nums ${
                            v === null ? "text-faint" : "text-bone"
                          }`}
                        >
                          {v === null ? "NR" : v.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="rise px-1 text-[11px] text-faint" style={{ animationDelay: "120ms" }}>
        Showing {results.length} of {PLAYERS.length - 1} players.{" "}
        {results.some((p) => p.singles === null) &&
          "Unrated players show NR until they have logged 5 matches."}
      </p>
    </div>
  );
}
