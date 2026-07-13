/**
 * DUBR — Dynamic Universal Badminton Rating.
 *
 * Ratings run 2.000–8.000, carried to three decimals like DUPR. A rating is
 * PROVISIONAL until the player has logged enough matches for it to mean
 * anything; provisional players are shown as "NR" (not rated), never as a
 * confident-looking default. The old design printed 5.500 / "Advanced" for a
 * dozen players with zero matches, which made the whole leaderboard read as
 * fabricated. Honesty about uncertainty is the product's entire credibility.
 */

export const RATING_MIN = 2;
export const RATING_MAX = 8;

/** Matches required before a rating stops being provisional. */
export const RELIABILITY_THRESHOLD = 5;

export type Level = {
  name: string;
  floor: number;
};

export const LEVELS: Level[] = [
  { name: "First Timer", floor: 2.0 },
  { name: "Beginner", floor: 3.0 },
  { name: "Intermediate", floor: 4.0 },
  { name: "Advanced", floor: 5.0 },
  { name: "Elite", floor: 6.0 },
  { name: "Professional", floor: 7.0 },
];

export function levelFor(rating: number): Level {
  return [...LEVELS].reverse().find((l) => rating >= l.floor) ?? LEVELS[0];
}

export function nextLevel(rating: number): Level | null {
  return LEVELS.find((l) => l.floor > rating) ?? null;
}

/** Position on the 2–8 scale, 0..1. Used by the rating rail. */
export function scalePos(rating: number): number {
  const t = (rating - RATING_MIN) / (RATING_MAX - RATING_MIN);
  return Math.min(1, Math.max(0, t));
}

/** Three decimals, always. A rating that renders as "5.3" looks like an opinion. */
export function fmt(rating: number | null): string {
  return rating === null ? "NR" : rating.toFixed(3);
}

export function fmtDelta(d: number): string {
  return `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d).toFixed(3)}`;
}

export type Discipline = "singles" | "doubles" | "mixed";

export const DISCIPLINES: { id: Discipline; label: string }[] = [
  { id: "singles", label: "Singles" },
  { id: "doubles", label: "Doubles" },
  { id: "mixed", label: "Mixed" },
];

export type Player = {
  id: string;
  name: string;
  initials: string;
  /** null = provisional / not yet rated. */
  singles: number | null;
  doubles: number | null;
  mixed: number | null;
  matches: number;
  wins: number;
  /** 0..1 — how much the system trusts this rating. */
  reliability: number;
  location: string;
  club?: string;
};

/**
 * A match is a record of what happened to FOUR ratings, not just yours.
 *
 * Every player on court carries their rating into the match and a different one
 * out of it, so each one is listed with the rating they held and the direction
 * it moved. That is the whole claim of a rating system — one result, every
 * participant repriced — and a card that only shows your own delta hides it.
 */
export type MatchPlayer = {
  name: string;
  /** The rating they held going in. null = unrated at the time. */
  rating: number | null;
  /** Which way this match moved them. */
  delta: number;
  /** Is this the account holder? */
  me?: boolean;
};

export type MatchSide = {
  players: MatchPlayer[];
  /** Score per game, parallel across the two sides. */
  games: number[];
};

export type Match = {
  id: string;
  /** The session or tournament this was played in. */
  event: string;
  date: string;
  location: string;
  discipline: Discipline;
  mine: MatchSide;
  theirs: MatchSide;
  won: boolean;
  /** The account holder's rating change. */
  delta: number;
};

/* ── Mock data ─────────────────────────────────────────────────────────── */

export const ME: Player = {
  id: "me",
  name: "Jonathan Chiang",
  initials: "JC",
  singles: 5.302,
  doubles: 5.417,
  mixed: null,
  matches: 14,
  wins: 9,
  reliability: 0.72,
  location: "Queens County, NY",
  club: "Kotofit LIC",
};

export const PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Mecream Osathanugrah",
    initials: "MO",
    singles: 6.109,
    doubles: 6.241,
    mixed: 5.88,
    matches: 41,
    wins: 33,
    reliability: 0.94,
    location: "Flushing, NY",
    club: "Kotofit Flushing",
  },
  {
    id: "p2",
    name: "Kevin Cheng",
    initials: "KC",
    singles: 5.932,
    doubles: 6.014,
    mixed: null,
    matches: 28,
    wins: 20,
    reliability: 0.88,
    location: "Jersey City, NJ",
    club: "Kotofit JC",
  },
  {
    id: "p3",
    name: "Brian Law",
    initials: "BL",
    singles: 5.826,
    doubles: 5.611,
    mixed: 5.44,
    matches: 22,
    wins: 15,
    reliability: 0.81,
    location: "Long Island City, NY",
    club: "Kotofit LIC",
  },
  {
    id: "p4",
    name: "Shuang Wei",
    initials: "SW",
    singles: 5.604,
    doubles: 5.72,
    mixed: null,
    matches: 17,
    wins: 10,
    reliability: 0.76,
    location: "Flushing, NY",
    club: "Kotofit Flushing",
  },
  {
    id: "p5",
    name: "Jun Jie Zhang",
    initials: "JZ",
    singles: 5.488,
    doubles: 5.203,
    mixed: 5.11,
    matches: 12,
    wins: 6,
    reliability: 0.64,
    location: "Queens County, NY",
    club: "Kotofit Flushing",
  },
  {
    id: "me",
    name: "Jonathan Chiang",
    initials: "JC",
    singles: 5.302,
    doubles: 5.417,
    mixed: null,
    matches: 14,
    wins: 9,
    reliability: 0.72,
    location: "Queens County, NY",
    club: "Kotofit LIC",
  },
  {
    id: "p6",
    name: "Sarah Tanaka",
    initials: "ST",
    singles: 5.144,
    doubles: 5.39,
    mixed: 5.5,
    matches: 19,
    wins: 11,
    reliability: 0.79,
    location: "Jersey City, NJ",
    club: "Kotofit JC",
  },
  {
    id: "p7",
    name: "Owen Zhang",
    initials: "OZ",
    singles: 4.977,
    doubles: 5.042,
    mixed: null,
    matches: 9,
    wins: 4,
    reliability: 0.55,
    location: "Flushing, NY",
    club: "Kotofit Flushing",
  },
  {
    id: "p8",
    name: "Amal Shaj",
    initials: "AS",
    singles: 4.61,
    doubles: 4.803,
    mixed: 4.72,
    matches: 7,
    wins: 2,
    reliability: 0.42,
    location: "Long Island City, NY",
    club: "Kotofit LIC",
  },
  {
    id: "p9",
    name: "Benjamin Chen",
    initials: "BC",
    singles: null,
    doubles: null,
    mixed: null,
    matches: 2,
    wins: 1,
    reliability: 0.12,
    location: "Queens County, NY",
  },
  {
    id: "p10",
    name: "Chun Kit Liu",
    initials: "CL",
    singles: null,
    doubles: null,
    mixed: null,
    matches: 0,
    wins: 0,
    reliability: 0,
    location: "Flushing, NY",
  },
];

export const MATCHES: Match[] = [
  {
    id: "m1",
    event: "Kotofit LIC — Tuesday Open Play",
    date: "07/09/2026",
    location: "Long Island City, NY",
    discipline: "doubles",
    won: true,
    delta: 0.061,
    mine: {
      games: [21, 19, 21],
      players: [
        { name: "Jonathan Chiang", rating: 5.417, delta: 0.061, me: true },
        { name: "Sarah Tanaka", rating: 5.39, delta: 0.054 },
      ],
    },
    theirs: {
      games: [18, 21, 16],
      players: [
        { name: "Brian Law", rating: 5.611, delta: -0.048 },
        { name: "Owen Zhang", rating: 5.042, delta: -0.057 },
      ],
    },
  },
  {
    id: "m2",
    event: "Kotofit JC — Singles Ladder",
    date: "07/02/2026",
    location: "Jersey City, NJ",
    discipline: "singles",
    won: false,
    delta: -0.024,
    mine: {
      games: [17, 21, 15],
      players: [{ name: "Jonathan Chiang", rating: 5.326, delta: -0.024, me: true }],
    },
    theirs: {
      games: [21, 19, 21],
      players: [{ name: "Kevin Cheng", rating: 5.932, delta: 0.019 }],
    },
  },
  {
    id: "m3",
    event: "Kotofit Flushing — Saturday Doubles",
    date: "06/28/2026",
    location: "Flushing, NY",
    discipline: "doubles",
    won: false,
    delta: -0.009,
    mine: {
      games: [21, 18],
      players: [
        { name: "Jonathan Chiang", rating: 5.335, delta: -0.009, me: true },
        { name: "Jun Jie Zhang", rating: 5.203, delta: -0.012 },
      ],
    },
    theirs: {
      games: [23, 21],
      players: [
        { name: "Mecream Osathanugrah", rating: 6.241, delta: 0.006 },
        { name: "Shuang Wei", rating: 5.72, delta: 0.008 },
      ],
    },
  },
  {
    id: "m4",
    event: "Kotofit LIC — Tuesday Open Play",
    date: "06/21/2026",
    location: "Long Island City, NY",
    discipline: "doubles",
    won: true,
    delta: 0.048,
    mine: {
      games: [21, 21],
      players: [
        { name: "Jonathan Chiang", rating: 5.287, delta: 0.048, me: true },
        { name: "Amal Shaj", rating: 4.803, delta: 0.071 },
      ],
    },
    theirs: {
      games: [14, 17],
      players: [
        { name: "Sarah Tanaka", rating: 5.39, delta: -0.039 },
        { name: "Owen Zhang", rating: 5.042, delta: -0.044 },
      ],
    },
  },
  {
    id: "m5",
    event: "Kotofit LIC — Singles Ladder",
    date: "06/14/2026",
    location: "Long Island City, NY",
    discipline: "singles",
    won: true,
    delta: 0.033,
    mine: {
      games: [21, 21],
      players: [{ name: "Jonathan Chiang", rating: 5.254, delta: 0.033, me: true }],
    },
    theirs: {
      games: [12, 15],
      players: [{ name: "Owen Zhang", rating: 4.977, delta: -0.041 }],
    },
  },
];

/** One rating, on the day a match moved it there. */
export type RatingPoint = {
  /** MM/DD/YYYY, same format as Match.date. */
  date: string;
  rating: number;
};

/**
 * A year of singles rating, oldest → newest. A rating is a walk, not a curve:
 * it goes down as well as up, and the chart is only worth anything if it says so.
 *
 * The last five points land on the dates of the five matches in MATCHES, and the
 * final step MUST equal the delta on the most recent one — the hero number and
 * the feed sit on the same screen and cannot disagree.
 */
export const HISTORY: RatingPoint[] = [
  { date: "07/12/2025", rating: 4.98 },
  { date: "07/16/2025", rating: 4.973 },
  { date: "07/19/2025", rating: 4.987 },
  { date: "07/22/2025", rating: 5.0 },
  { date: "07/25/2025", rating: 4.989 },
  { date: "07/29/2025", rating: 4.994 },
  { date: "08/03/2025", rating: 5.009 },
  { date: "08/07/2025", rating: 5.024 },
  { date: "08/10/2025", rating: 5.009 },
  { date: "08/13/2025", rating: 4.996 },
  { date: "08/16/2025", rating: 4.987 },
  { date: "08/19/2025", rating: 4.98 },
  { date: "08/22/2025", rating: 4.991 },
  { date: "08/26/2025", rating: 4.997 },
  { date: "08/30/2025", rating: 4.989 },
  { date: "09/03/2025", rating: 5.001 },
  { date: "09/07/2025", rating: 5.012 },
  { date: "09/11/2025", rating: 4.998 },
  { date: "09/15/2025", rating: 5.008 },
  { date: "09/20/2025", rating: 5.014 },
  { date: "09/25/2025", rating: 5.0 },
  { date: "09/29/2025", rating: 5.01 },
  { date: "10/02/2025", rating: 5.015 },
  { date: "10/06/2025", rating: 5.03 },
  { date: "10/09/2025", rating: 5.045 },
  { date: "10/14/2025", rating: 5.06 },
  { date: "10/17/2025", rating: 5.054 },
  { date: "10/22/2025", rating: 5.042 },
  { date: "10/25/2025", rating: 5.036 },
  { date: "10/29/2025", rating: 5.022 },
  { date: "11/02/2025", rating: 5.037 },
  { date: "11/05/2025", rating: 5.052 },
  { date: "11/08/2025", rating: 5.057 },
  { date: "11/13/2025", rating: 5.049 },
  { date: "11/16/2025", rating: 5.041 },
  { date: "11/21/2025", rating: 5.048 },
  { date: "11/26/2025", rating: 5.052 },
  { date: "11/30/2025", rating: 5.043 },
  { date: "12/03/2025", rating: 5.036 },
  { date: "12/07/2025", rating: 5.051 },
  { date: "12/11/2025", rating: 5.064 },
  { date: "12/14/2025", rating: 5.053 },
  { date: "12/19/2025", rating: 5.059 },
  { date: "12/23/2025", rating: 5.066 },
  { date: "12/26/2025", rating: 5.075 },
  { date: "12/31/2025", rating: 5.07 },
  { date: "01/03/2026", rating: 5.056 },
  { date: "01/06/2026", rating: 5.066 },
  { date: "01/10/2026", rating: 5.072 },
  { date: "01/14/2026", rating: 5.087 },
  { date: "01/18/2026", rating: 5.103 },
  { date: "01/22/2026", rating: 5.094 },
  { date: "01/25/2026", rating: 5.078 },
  { date: "01/30/2026", rating: 5.093 },
  { date: "02/02/2026", rating: 5.082 },
  { date: "02/05/2026", rating: 5.088 },
  { date: "02/10/2026", rating: 5.083 },
  { date: "02/14/2026", rating: 5.092 },
  { date: "02/19/2026", rating: 5.106 },
  { date: "02/23/2026", rating: 5.121 },
  { date: "02/27/2026", rating: 5.113 },
  { date: "03/03/2026", rating: 5.126 },
  { date: "03/07/2026", rating: 5.136 },
  { date: "03/12/2026", rating: 5.141 },
  { date: "03/17/2026", rating: 5.151 },
  { date: "03/20/2026", rating: 5.142 },
  { date: "03/25/2026", rating: 5.153 },
  { date: "03/29/2026", rating: 5.161 },
  { date: "04/02/2026", rating: 5.175 },
  { date: "04/07/2026", rating: 5.161 },
  { date: "04/11/2026", rating: 5.172 },
  { date: "04/16/2026", rating: 5.181 },
  { date: "04/20/2026", rating: 5.194 },
  { date: "04/23/2026", rating: 5.206 },
  { date: "04/27/2026", rating: 5.193 },
  { date: "05/02/2026", rating: 5.186 },
  { date: "05/06/2026", rating: 5.194 },
  { date: "05/09/2026", rating: 5.18 },
  { date: "05/13/2026", rating: 5.194 },
  { date: "05/16/2026", rating: 5.201 },
  { date: "05/19/2026", rating: 5.19 },
  { date: "05/24/2026", rating: 5.201 },
  { date: "05/31/2026", rating: 5.188 },
  { date: "06/07/2026", rating: 5.24 },
  { date: "06/14/2026", rating: 5.229 },
  { date: "06/21/2026", rating: 5.277 },
  { date: "06/28/2026", rating: 5.268 },
  { date: "07/02/2026", rating: 5.241 },
  { date: "07/09/2026", rating: 5.302 },
];

/** Last 8 rating points, oldest → newest. Drives the profile sparkline. */
export const TREND: number[] = HISTORY.slice(-8).map((p) => p.rating);

/** MM/DD/YYYY → Date. Built field by field, because `new Date("07/09/2026")`
    is parsed in the runtime's local zone by some engines and UTC by others. */
export function parseDate(date: string): Date {
  const [m, d, y] = date.split("/").map(Number);
  return new Date(y, m - 1, d);
}

export type Range = "week" | "month" | "year";

export const RANGES: { id: Range; label: string; name: string; days: number }[] = [
  { id: "week", label: "1W", name: "Past week", days: 7 },
  { id: "month", label: "1M", name: "Past month", days: 30 },
  { id: "year", label: "1Y", name: "Past year", days: 365 },
];

/**
 * The window is measured back from the LAST MATCH, not from today. A player who
 * has not played in three weeks still has a "past week" of form to look at — an
 * empty chart would be reporting on the calendar, not on them.
 */
export function historyFor(range: Range): RatingPoint[] {
  const days = RANGES.find((r) => r.id === range)!.days;
  const last = parseDate(HISTORY[HISTORY.length - 1].date);
  const floor = last.getTime() - days * 86_400_000;
  const window = HISTORY.filter((p) => parseDate(p.date).getTime() >= floor);
  /* A line needs two points. Rather than draw nothing, reach back for one more. */
  return window.length >= 2 ? window : HISTORY.slice(-2);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Where to put a label on the x axis, and what it should say.
 *
 * Over a year the unit the eye wants is the month, so a tick lands on the first
 * point of each month and says only "Sep" — a date would be noise at that width.
 * Shorter windows have no month boundaries to speak of, so they fall back to the
 * day, thinned so the labels never collide.
 */
export function axisTicks(points: RatingPoint[], range: Range): { index: number; label: string }[] {
  if (range === "year") {
    const ticks: { index: number; label: string }[] = [];
    let month = -1;
    points.forEach((p, i) => {
      const d = parseDate(p.date);
      if (d.getMonth() === month) return;
      month = d.getMonth();
      ticks.push({ index: i, label: MONTHS[month] });
    });
    return ticks;
  }

  const last = points.length - 1;
  const every = Math.max(1, Math.ceil(last / 5));
  const indices: number[] = [];
  for (let i = 0; i <= last; i += every) indices.push(i);
  /* The last point always gets a tick — it is the one being read. If the stride
     left one too close to it, that one goes rather than crowd the label. */
  if (indices[indices.length - 1] !== last) {
    if (last - indices[indices.length - 1] < every / 2) indices.pop();
    indices.push(last);
  }

  return indices.map((i) => {
    const d = parseDate(points[i].date);
    return { index: i, label: `${MONTHS[d.getMonth()]} ${d.getDate()}` };
  });
}

export function leaderboard(discipline: Discipline): Player[] {
  return [...PLAYERS]
    .filter((p) => p[discipline] !== null)
    .sort((a, b) => (b[discipline] as number) - (a[discipline] as number));
}

export function provisional(discipline: Discipline): Player[] {
  return PLAYERS.filter((p) => p[discipline] === null);
}

/* ── A single player ──────────────────────────────────────────────────────── */

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function rankOf(id: string, discipline: Discipline): number | null {
  const i = leaderboard(discipline).findIndex((p) => p.id === id);
  return i === -1 ? null : i + 1;
}

/**
 * A rating trajectory for a player we hold no real history for.
 *
 * DETERMINISTIC, and that is the whole point: it is seeded off the player's id,
 * so the server and the client generate the identical series. `Math.random()`
 * here would produce a different line on each, and React would throw a
 * hydration mismatch. It also means a player's curve never changes between
 * visits, which a random one would.
 *
 * This is mock data standing in for a real per-player history endpoint. It ends
 * exactly on the player's current rating, so the chart and the headline number
 * can never disagree.
 */
export function syntheticHistory(player: Player, discipline: Discipline): number[] {
  const end = player[discipline];
  if (end === null) return [];

  const n = Math.min(Math.max(player.matches, 3), 16);

  // xorshift-ish PRNG seeded from the id — small, deterministic, good enough.
  let seed = 0;
  for (const c of player.id + discipline) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 0xffffffff;
  };

  /* The overall DIRECTION is set by the player's record, not by chance. An
     unbiased random walk gave the #1 player — 80% wins, top of the board — a
     falling red trajectory, which flatly contradicts every other number on the
     page. A winning record trends up; a losing one trends down. */
  const winRate = player.matches ? player.wins / player.matches : 0.5;
  const drift = (winRate - 0.5) * 0.6; // 80% wins ⇒ +0.18 over the window
  const start = end - drift;

  /* A less reliable rating has been bouncing around more on its way here. */
  const wobble = 0.05 * (1.4 - player.reliability);

  return Array.from({ length: n }, (_, i) => {
    // Anchor both ends: the last point IS the rating printed above the chart.
    if (i === n - 1) return end;
    if (i === 0) return Number(start.toFixed(3));
    const base = start + (end - start) * (i / (n - 1));
    return Number((base + (rand() - 0.5) * wobble).toFixed(3));
  });
}

/** Every match this player appears in, most recent first. */
export function matchesFor(player: Player): Match[] {
  return MATCHES.filter((m) =>
    [...m.mine.players, ...m.theirs.players].some((p) => p.name === player.name),
  );
}

/**
 * Your record against this player. Only counts matches where they were on the
 * OTHER side — playing alongside someone tells you nothing about beating them.
 */
export function headToHead(player: Player): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;

  for (const m of MATCHES) {
    const iPlayed = m.mine.players.some((p) => p.me);
    if (!iPlayed) continue;
    const theyOpposed = m.theirs.players.some((p) => p.name === player.name);
    if (!theyOpposed) continue;
    if (m.won) wins++;
    else losses++;
  }

  return { wins, losses };
}
