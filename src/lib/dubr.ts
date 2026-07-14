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

/* No LEVELS ladder. A named tier ("Advanced", "Elite") is a SECOND rating sitting
   beside the real one, coarser and louder — and the two disagree constantly: 4.999
   and 5.001 are the same player and were being labelled a division apart. The
   number is the rating. It is already legible, and it does not round people into
   a bucket they then argue about. */

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

/** The days a player is usually free. Shared by the roster and by your own
    profile, because "find me a game" has to read the same field on both sides. */
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

/**
 * Two values, because a filter needs two: the roster is either men or women, and
 * the person searching is looking for either, or for anybody. Modelled as a
 * closed union rather than a free string so "Anybody" cannot be a THIRD gender —
 * it is the absence of a filter, and it lives in the filter, not in the player.
 */
export type Gender = "man" | "woman";

export const GENDER_LABEL: Record<Gender, string> = { man: "Man", woman: "Woman" };

/**
 * Your birthday, ISO. The roster stores an AGE because it is mock data frozen at
 * a moment; your OWN profile stores the birthday, because an age is a fact that
 * expires and a stored one is wrong within a year of being typed.
 *
 * This is the seed for that field, and it is the birthday that produces ME.age.
 */
export const ME_BIRTHDAY = "1995-03-08";

/** Age from an ISO birthday, as of today. Counts whether the birthday has landed
    yet this year — a naive year subtraction is wrong for half the calendar. */
export function ageFrom(birthday: string, today: Date = new Date()): number | null {
  const born = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(born.getTime())) return null;

  let age = today.getFullYear() - born.getFullYear();
  const month = today.getMonth() - born.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < born.getDate())) age--;

  return age >= 0 && age < 130 ? age : null;
}

/** Which formats a player actually turns up for. Not derivable from their
    ratings: an unrated player has no ratings at all and still plays doubles. */
export type Format = "singles" | "doubles";

export type Player = {
  id: string;
  name: string;
  initials: string;
  gender: Gender;
  age: number;
  /** Miles from you. Precomputed rather than derived from a lat/lng we do not
      have — when there is a real geocoder this becomes a distance query. */
  distance: number;
  plays: Format[];
  days: Day[];
  /** null = provisional / not yet rated. */
  singles: number | null;
  doubles: number | null;
  mixed: number | null;
  matches: number;
  wins: number;
  /** 0..1 — how much the system trusts this rating. */
  reliability: number;
  location: string;
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
  gender: "man",
  age: 31,
  distance: 0,
  plays: ["singles", "doubles"],
  days: ["Tue", "Thu", "Sat"],
  singles: 5.302,
  doubles: 5.417,
  mixed: null,
  matches: 109,
  wins: 72,
  reliability: 0.72,
  location: "Queens County, NY",
};

export const PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Mecream Osathanugrah",
    initials: "MO",
    gender: "man",
    age: 34,
    distance: 6.2,
    plays: ["singles", "doubles"],
    days: ["Wed", "Sat", "Sun"],
    singles: 6.109,
    doubles: 6.241,
    mixed: 5.88,
    matches: 41,
    wins: 33,
    reliability: 0.94,
    location: "Flushing, NY",
  },
  {
    id: "p2",
    name: "Kevin Cheng",
    initials: "KC",
    gender: "man",
    age: 29,
    distance: 11.4,
    plays: ["singles"],
    days: ["Thu", "Sun"],
    singles: 5.932,
    doubles: 6.014,
    mixed: null,
    matches: 28,
    wins: 20,
    reliability: 0.88,
    location: "Jersey City, NJ",
  },
  {
    id: "p3",
    name: "Brian Law",
    initials: "BL",
    gender: "man",
    age: 41,
    distance: 1.8,
    plays: ["singles", "doubles"],
    days: ["Tue", "Sun"],
    singles: 5.826,
    doubles: 5.611,
    mixed: 5.44,
    matches: 22,
    wins: 15,
    reliability: 0.81,
    location: "Long Island City, NY",
  },
  {
    id: "p4",
    name: "Shuang Wei",
    initials: "SW",
    gender: "woman",
    age: 26,
    distance: 6.9,
    plays: ["doubles"],
    days: ["Mon", "Wed", "Fri"],
    singles: 5.604,
    doubles: 5.72,
    mixed: null,
    matches: 17,
    wins: 10,
    reliability: 0.76,
    location: "Flushing, NY",
  },
  {
    id: "p5",
    name: "Jun Jie Zhang",
    initials: "JZ",
    gender: "man",
    age: 19,
    distance: 3.1,
    plays: ["singles", "doubles"],
    days: ["Sat", "Sun"],
    singles: 5.488,
    doubles: 5.203,
    mixed: 5.11,
    matches: 12,
    wins: 6,
    reliability: 0.64,
    location: "Queens County, NY",
  },
  /**
   * You, BY REFERENCE — not a second copy.
   *
   * There used to be a full literal here duplicating ME, and the two had already
   * drifted: ME said 109 matches and 72 wins, this said 14 and 9. So the board, the
   * directory and your public page reported a different record and a different
   * follower count from home, depending only on which of the two objects the page
   * happened to import. One person cannot be two rows.
   */
  ME,
  {
    id: "p6",
    name: "Sarah Tanaka",
    initials: "ST",
    gender: "woman",
    age: 33,
    distance: 12,
    plays: ["doubles"],
    days: ["Tue", "Thu", "Sat"],
    singles: 5.144,
    doubles: 5.39,
    mixed: 5.5,
    matches: 19,
    wins: 11,
    reliability: 0.79,
    location: "Jersey City, NJ",
  },
  {
    id: "p7",
    name: "Owen Zhang",
    initials: "OZ",
    gender: "man",
    age: 22,
    distance: 7.4,
    plays: ["singles", "doubles"],
    days: ["Mon", "Thu"],
    singles: 4.977,
    doubles: 5.042,
    mixed: null,
    matches: 9,
    wins: 4,
    reliability: 0.55,
    location: "Flushing, NY",
  },
  {
    id: "p8",
    name: "Amal Shaj",
    initials: "AS",
    gender: "man",
    age: 47,
    distance: 2.3,
    plays: ["doubles"],
    days: ["Wed", "Sat"],
    singles: 4.61,
    doubles: 4.803,
    mixed: 4.72,
    matches: 7,
    wins: 2,
    reliability: 0.42,
    location: "Long Island City, NY",
  },
  {
    id: "p9",
    name: "Benjamin Chen",
    initials: "BC",
    gender: "man",
    age: 17,
    distance: 4.8,
    plays: ["singles"],
    days: ["Sat", "Sun"],
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
    gender: "woman",
    age: 58,
    distance: 8.6,
    plays: ["doubles"],
    days: ["Mon", "Fri"],
    singles: null,
    doubles: null,
    mixed: null,
    matches: 0,
    wins: 0,
    reliability: 0,
    location: "Flushing, NY",
  },
];

/**
 * A match somebody else logged, waiting on YOU.
 *
 * The log screen promises "your opponent confirms it, then both ratings move" —
 * so a match logged against you has to land somewhere you can accept or dispute
 * it. Without this the promise is a lie and a rating can be moved by a score you
 * never agreed to, which is the one thing a rating system cannot allow.
 */
export type PendingMatch = {
  id: string;
  event: string;
  date: string;
  location: string;
  discipline: Discipline;
  /** Who submitted the score. */
  loggedBy: string;
  mine: MatchSide;
  theirs: MatchSide;
  won: boolean;
  /** What confirming this will do to your rating. Shown BEFORE you confirm. */
  projected: number;
};

export const PENDING: PendingMatch[] = [
  {
    id: "pm1",
    event: "Kotofit LIC — Tuesday Open Play",
    date: "07/12/2026",
    location: "Long Island City, NY",
    discipline: "doubles",
    loggedBy: "Sarah Tanaka",
    won: true,
    projected: 0.052,
    mine: {
      games: [21, 21],
      players: [
        { name: "Jonathan Chiang", rating: 5.302, delta: 0.052, me: true },
        { name: "Sarah Tanaka", rating: 5.39, delta: 0.047 },
      ],
    },
    theirs: {
      games: [17, 19],
      players: [
        { name: "Owen Zhang", rating: 5.042, delta: -0.041 },
        { name: "Amal Shaj", rating: 4.803, delta: -0.038 },
      ],
    },
  },
  {
    id: "pm2",
    event: "Kotofit JC — Singles Ladder",
    date: "07/11/2026",
    location: "Jersey City, NJ",
    discipline: "singles",
    loggedBy: "Kevin Cheng",
    won: false,
    projected: -0.031,
    mine: {
      games: [18, 16],
      players: [{ name: "Jonathan Chiang", rating: 5.302, delta: -0.031, me: true }],
    },
    theirs: {
      games: [21, 21],
      players: [{ name: "Kevin Cheng", rating: 5.932, delta: 0.014 }],
    },
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

/* ── The player filter ────────────────────────────────────────────────────
   The directory's job is to answer ONE question — "who can I get a game with"
   — and that question has five or six clauses, not one. It lives here rather
   than in the page because it is a rule about players, not about a screen.  */

export const DISTANCE_MAX = 100;
/** The rating scale runs 2–8, so the filter does too. */
export const [RATING_FLOOR, RATING_CEIL] = [RATING_MIN, RATING_MAX];
/** The ends are open buckets: 18 means "under 19", 80 means "80 and up". */
export const AGE_FLOOR = 18;
export const AGE_CEIL = 80;

export type PlayerFilters = {
  /** Free-text name search. */
  q: string;
  /** Free text, matched as a case-insensitive SUBSTRING of the player's location.
      "" = anywhere. Substring rather than equality because "queens" and "ny" are
      real things to type and neither is the whole of any location string. */
  location: string;
  /** Miles. 0 = no limit, which is the DEFAULT — a distance filter you did not
      ask for silently hiding half the club is the worst kind of default. */
  distance: number;
  gender: Gender | "any";
  /** Both, normally. Empty means nobody matches, and the UI says so rather than
      quietly showing everyone — an empty selection is a real, if useless, query. */
  formats: Format[];
  rating: [number, number];
  age: [number, number];
  /** Days you want them free. Empty = any day. */
  days: Day[];
  /**
   * Unrated players have NO rating, so a rating range EXCLUDES them by
   * construction — `null` is not between 2 and 8. That exclusion has to be a
   * switch you can see, not a side effect of touching a slider: this app's whole
   * position is that NR is an honest state, and a directory that disappears every
   * newcomer the moment you narrow the rating is a directory that lies about who
   * is at the club.
   */
  includeUnrated: boolean;
};

export const DEFAULT_FILTERS: PlayerFilters = {
  q: "",
  location: "",
  distance: 0,
  gender: "any",
  formats: ["singles", "doubles"],
  rating: [RATING_FLOOR, RATING_CEIL],
  age: [AGE_FLOOR, AGE_CEIL],
  days: [],
  includeUnrated: true,
};

/** The rating that the selected formats are asking about. A doubles-only search
    should be judged on the doubles rating, not on a singles rating the player may
    barely have earned. */
function ratingsFor(p: Player, formats: Format[]): (number | null)[] {
  return formats.map((f) => p[f]);
}

export function filterRoster(f: PlayerFilters, roster: Player[] = ROSTER): Player[] {
  const term = f.q.trim().toLowerCase();
  const place = f.location.trim().toLowerCase();

  return roster.filter((p) => {
    if (p.id === "me") return false;
    if (term && !p.name.toLowerCase().includes(term)) return false;
    if (place && !p.location.toLowerCase().includes(place)) return false;
    if (f.distance > 0 && p.distance > f.distance) return false;
    if (f.gender !== "any" && p.gender !== f.gender) return false;
    if (!f.formats.some((x) => p.plays.includes(x))) return false;

    /* Open buckets at both ends: at the floor there is no lower bound at all, so
       the 17-year-olds are in; at the ceiling there is no upper bound. */
    const [ageLo, ageHi] = f.age;
    if (ageLo > AGE_FLOOR && p.age < ageLo) return false;
    if (ageHi < AGE_CEIL && p.age > ageHi) return false;

    if (f.days.length && !f.days.some((d) => p.days.includes(d))) return false;

    const ratings = ratingsFor(p, f.formats);
    const rated = ratings.filter((r): r is number => r !== null);
    if (!rated.length) return f.includeUnrated;

    const [lo, hi] = f.rating;
    return rated.some((r) => r >= lo && r <= hi);
  });
}

/** How many clauses are narrowing the result, for the "Filters · 3" badge and to
    decide whether "Reset" has anything to do. */
export function activeFilterCount(f: PlayerFilters): number {
  let n = 0;
  if (f.location.trim()) n++;
  if (f.distance > 0) n++;
  if (f.gender !== "any") n++;
  if (f.formats.length !== 2) n++;
  if (f.rating[0] > RATING_FLOOR || f.rating[1] < RATING_CEIL) n++;
  if (f.age[0] > AGE_FLOOR || f.age[1] < AGE_CEIL) n++;
  if (f.days.length) n++;
  if (!f.includeUnrated) n++;
  return n;
}

export function leaderboard(discipline: Discipline): Player[] {
  return [...ROSTER]
    .filter((p) => p[discipline] !== null)
    .sort((a, b) => (b[discipline] as number) - (a[discipline] as number));
}

export function provisional(discipline: Discipline): Player[] {
  return ROSTER.filter((p) => p[discipline] === null);
}

/* ── The board ────────────────────────────────────────────────────────────── */

export const PAGE_SIZE = 50;

export type BoardRow = {
  player: Player;
  /** null for an unrated player: they are listed, but they do not hold a rank. */
  rank: number | null;
};

/**
 * Every player in one list — rated and unrated together.
 *
 * Rated players sort by rating and take ranks 1..N. Unrated players follow, and
 * are given NO rank: a rank is a claim about where you stand, and DUBR does not
 * make that claim until it has enough matches to back it. They are ordered by
 * how close they are to qualifying, so the row nearest a real rating sits
 * highest — the list reads as a queue, not as a scrapheap.
 */
export function board(discipline: Discipline): BoardRow[] {
  const rated = leaderboard(discipline).map((player, i) => ({ player, rank: i + 1 }));

  const unrated = provisional(discipline)
    .sort((a, b) => b.matches - a.matches)
    .map((player) => ({ player, rank: null }));

  return [...rated, ...unrated];
}

/** The 1-indexed page a given player falls on, so "find me" can jump to it. */
export function pageOf(rows: BoardRow[], id: string): number {
  const i = rows.findIndex((r) => r.player.id === id);
  return i === -1 ? 1 : Math.floor(i / PAGE_SIZE) + 1;
}

/* ── The rest of the field ─────────────────────────────────────────────────
   PLAYERS above are the hand-written ones that appear in real matches. These
   are the rest of the club, so the board has a realistic depth to paginate.

   DETERMINISTIC, seeded off the index — never Math.random(). A random roster
   would generate different players on the server and on the client and throw a
   hydration mismatch, and the board would reshuffle on every visit. Replace
   this whole block with the real roster when there is one. */

const FIRST = [
  "Wei", "Aditya", "Marcus", "Priya", "Sofia", "Hiro", "Elena", "Rahul", "Nina", "Diego",
  "Yuki", "Omar", "Clara", "Tomas", "Anika", "Leo", "Mei", "Ravi", "Isla", "Kenji",
  "Zara", "Felix", "Lena", "Arjun", "Nora", "Pablo", "Ivy", "Sanjay", "Maya", "Erik",
  "Tara", "Nikhil", "Rosa", "Jae", "Lucia", "Amir", "Freya", "Dev", "Cara", "Miguel",
  "Hana", "Vikram", "Elsa", "Karim", "Talia", "Bruno", "Sana", "Oscar", "Ines", "Rohit",
  "Vera", "Ali",
];

const LAST = [
  "Chen", "Patel", "Nguyen", "Silva", "Kim", "Tanaka", "Rossi", "Sharma", "Novak", "Costa",
  "Sato", "Haddad", "Muller", "Duarte", "Reddy", "Berg", "Wu", "Iyer", "Murphy", "Ito",
  "Khan", "Weber", "Larsen", "Mehta", "Olsen", "Ortiz", "Doyle", "Rao", "Lopez", "Voss",
  "Bose", "Gupta", "Marin", "Park", "Ferrer", "Aziz", "Dahl", "Menon", "Byrne", "Torres",
  "Mori", "Singh", "Holm", "Nasser", "Levi", "Alves", "Malik", "Falk", "Neves", "Verma",
  "Petrov", "Aslan",
];

/**
 * Where players are, and roughly how far that is from you.
 *
 * A player has a LOCATION and nothing else. There used to be a club on the bio
 * too, but which facility somebody prefers to book is not who they are — it is a
 * fact about a building. Location is what tells you whether a game is reachable,
 * and it is the only one of the two that the directory can act on.
 */
const LOCATIONS = ["Long Island City, NY", "Flushing, NY", "Jersey City, NJ"];
/** Rough miles from the account holder. Parallel to LOCATIONS. */
const LOCATION_MILES = [1.5, 6, 11];

function makeRoster(count: number): Player[] {
  const out: Player[] = [];

  /* Names must be UNIQUE. The obvious formula — FIRST[i % 52] with
     LAST[(i * 7 + 3) % 52] — silently repeats: 7 × 52 is a multiple of 52, so
     player i and player i + 52 get the identical first AND last name. That put
     the same person on the board twice (Elena Alves at #3 and #30), which reads
     as broken data the moment anyone scrolls. The set below catches any
     collision, whatever the formula. */
  const taken = new Set<string>(PLAYERS.map((p) => p.name));

  for (let i = 0; i < count; i++) {
    let seed = (i + 1) * 2654435761;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      seed >>>= 0;
      return seed / 0xffffffff;
    };

    const first = FIRST[i % FIRST.length];

    let last = "";
    for (let k = 0; k < LAST.length; k++) {
      const candidate = LAST[(i * 7 + 3 + k) % LAST.length];
      if (!taken.has(`${first} ${candidate}`)) {
        last = candidate;
        break;
      }
    }
    if (!last) continue; // every surname taken for this forename — skip, don't duplicate

    const name = `${first} ${last}`;
    taken.add(name);

    /* About one in eight is still provisional, so the unrated tail on the board
       is a real section rather than a token row. */
    const unrated = i % 8 === 5;
    const matches = unrated ? Math.floor(rand() * 5) : 6 + Math.floor(rand() * 40);
    const wins = unrated
      ? Math.floor(rand() * (matches + 1))
      : Math.round(matches * (0.28 + rand() * 0.5));

    // Ratings cluster in the middle of the scale, as a real club's do.
    const base = 3.4 + rand() * 2.5;
    /* `(i * 3) % 3` — which is what this was, inherited from the club formula —
       is ZERO for every i, so the entire generated roster lived in Long Island
       City and the location filter had exactly one populated option. Step by 1. */
    const area = i % LOCATIONS.length;

    /* Distance is anchored to the LOCATION, not rolled independently: everybody
       in Long Island City is genuinely near you and everybody in Jersey City
       genuinely is not, so the distance filter and the location filter agree with
       each other instead of contradicting each other. */
    const distance = Number((LOCATION_MILES[area] + rand() * 5).toFixed(1));

    /* Ages skew young, with a real tail. A flat 18–80 roll would put as many
       70-year-olds on the board as 25-year-olds, and the age filter would then
       be testing against a population no club has ever had. */
    const age = Math.round(18 + Math.pow(rand(), 1.9) * 56);

    /* Everyone plays doubles — it is the format a club night is made of. Singles
       is the smaller commitment to make, so it is the one that varies. */
    const plays: Format[] = rand() < 0.55 ? ["singles", "doubles"] : ["doubles"];

    /* Two or three nights a week, contiguous-ish, not a random scatter. */
    const start = Math.floor(rand() * DAYS.length);
    const nights = 2 + Math.floor(rand() * 2);
    const days = Array.from({ length: nights }, (_, k) => DAYS[(start + k * 2) % DAYS.length]);

    out.push({
      id: `r${i}`,
      name,
      initials: (first[0] + last[0]).toUpperCase(),
      gender: rand() < 0.58 ? "man" : "woman",
      age,
      distance,
      plays,
      days: [...new Set(days)],
      singles: unrated ? null : Number(base.toFixed(3)),
      doubles: unrated ? null : Number((base + (rand() - 0.45) * 0.4).toFixed(3)),
      mixed: unrated || rand() < 0.35 ? null : Number((base + (rand() - 0.5) * 0.5).toFixed(3)),
      matches,
      wins,
      reliability: unrated
        ? Number((matches / RELIABILITY_THRESHOLD / 2).toFixed(2))
        : Number(Math.min(0.98, 0.35 + matches / 45).toFixed(2)),
      location: LOCATIONS[area],
    });
  }

  return out;
}

/** The hand-written players plus the generated field. This is what the board,
    the player directory, and every lookup read from. */
export const ROSTER: Player[] = [...PLAYERS, ...makeRoster(62)];

/**
 * Every location that somebody on the roster is actually in, alphabetical.
 *
 * DERIVED from the roster rather than hand-listed beside it. A hand-written list
 * is a second source of truth that drifts the moment a player moves: you get an
 * option in the dropdown that matches nobody, or a player in a place the dropdown
 * cannot name. Neither is possible if the options ARE the data.
 */
export const LOCATION_OPTIONS: string[] = [...new Set(ROSTER.map((p) => p.location))].sort();

/* ── A single player ──────────────────────────────────────────────────────── */

export function getPlayer(id: string): Player | undefined {
  return ROSTER.find((p) => p.id === id);
}

/**
 * A player's follower / following counts.
 *
 * DERIVED from their id and their record rather than stored on the player, for
 * the same reason the location options are derived: a hand-written number on 80
 * players is 80 chances to drift, and the generated half of the roster has no
 * hand to write it. It is deterministic, so the server render and the client
 * render agree — a count that changes on hydration would be a visible flicker.
 *
 * Followers scale with how much a player has actually played, because on a real
 * board they do: the people with 40 matches are the people other people watch.
 */
export function socialFor(player: Player): { followers: number; following: number } {
  let h = 2166136261;
  for (let i = 0; i < player.id.length; i++) {
    h = Math.imul(h ^ player.id.charCodeAt(i), 16777619) >>> 0;
  }

  return {
    followers: 4 + (h % 40) + player.matches * 2,
    following: 6 + ((h >>> 8) % 55),
  };
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
