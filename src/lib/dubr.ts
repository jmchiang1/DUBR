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

/** Last 8 rating points, oldest → newest. Drives the sparkline.
    The final step MUST equal the delta on the most recent match in MATCHES —
    the hero and the feed sit on the same screen and cannot disagree. */
export const TREND = [5.201, 5.188, 5.24, 5.229, 5.277, 5.268, 5.241, 5.302];

export function leaderboard(discipline: Discipline): Player[] {
  return [...PLAYERS]
    .filter((p) => p[discipline] !== null)
    .sort((a, b) => (b[discipline] as number) - (a[discipline] as number));
}

export function provisional(discipline: Discipline): Player[] {
  return PLAYERS.filter((p) => p[discipline] === null);
}
