/**
 * Events.
 *
 * DUBR is a UNIVERSAL rating, so the events list cannot be one operator's
 * calendar. Any badminton venue can run a session against the same scale — a
 * club in Milpitas, a university league in Boston, a national tournament in
 * Orange County — and a rating earned at one is worth exactly what it is worth
 * at the others. That portability IS the product; a list showing only Kotofit
 * sessions would quietly argue the opposite.
 *
 * So every event names its own HOST, and the hosts are independent of each
 * other and of us.
 */

export type EventKind = "open-play" | "tournament" | "league" | "clinic";

export const KINDS: { id: EventKind; label: string }[] = [
  { id: "open-play", label: "Open Play" },
  { id: "tournament", label: "Tournaments" },
  { id: "league", label: "Leagues" },
  { id: "clinic", label: "Clinics" },
];

export const KIND_LABEL: Record<EventKind, string> = {
  "open-play": "Open Play",
  tournament: "Tournament",
  league: "League",
  clinic: "Clinic",
};

export type BadmintonEvent = {
  id: string;
  kind: EventKind;
  name: string;
  /** The venue or organisation running it. Not us. */
  host: string;
  city: string;
  /** Human date. A single session, or a range for a tournament or league. */
  when: string;
  /** The DUBR window the event is open to. null = open to any rating. */
  band: [number, number] | null;
  /** Disciplines actually played. */
  formats: string[];
  /** Spots left. 0 = full. */
  spots: number;
  capacity: number;
  /** In dollars. 0 = free. */
  fee: number;
  /** Does the result move your DUBR? Some clinics do not. */
  rated: boolean;
  /** Distance from you, miles. */
  distance: number;
};

export const EVENTS: BadmintonEvent[] = [
  {
    id: "e1",
    kind: "open-play",
    name: "Tuesday Night Open Play",
    host: "Kotofit LIC",
    city: "Long Island City, NY",
    when: "Tue · 7:00 – 10:00 PM",
    band: [4.5, 6.0],
    formats: ["Doubles"],
    spots: 3,
    capacity: 24,
    fee: 25,
    rated: true,
    distance: 2.1,
  },
  {
    id: "e2",
    kind: "tournament",
    name: "Empire State Open 2026",
    host: "Queens Badminton Center",
    city: "Flushing, NY",
    when: "Aug 15 – 17",
    band: [5.0, 8.0],
    formats: ["Singles", "Doubles", "Mixed"],
    spots: 18,
    capacity: 128,
    fee: 75,
    rated: true,
    distance: 6.4,
  },
  {
    id: "e3",
    kind: "league",
    name: "Metro Winter League — Div. 2",
    host: "NYC Badminton League",
    city: "Manhattan, NY",
    when: "Sep 8 – Dec 14 · Mondays",
    band: [4.0, 5.5],
    formats: ["Doubles"],
    spots: 6,
    capacity: 48,
    fee: 180,
    rated: true,
    distance: 8.9,
  },
  {
    id: "e4",
    kind: "open-play",
    name: "Saturday Morning Drop-In",
    host: "Bay Badminton Center",
    city: "Milpitas, CA",
    when: "Sat · 9:00 AM – 12:00 PM",
    band: null,
    formats: ["Singles", "Doubles"],
    spots: 12,
    capacity: 40,
    fee: 20,
    rated: true,
    distance: 2871,
  },
  {
    id: "e5",
    kind: "tournament",
    name: "Pacific Coast Championships",
    host: "Orange County Badminton Club",
    city: "Orange, CA",
    when: "Oct 3 – 5",
    band: [6.0, 8.0],
    formats: ["Singles", "Doubles"],
    spots: 0,
    capacity: 96,
    fee: 110,
    rated: true,
    distance: 2789,
  },
  {
    id: "e6",
    kind: "clinic",
    name: "Footwork & Defense Clinic",
    host: "Boston Badminton Academy",
    city: "Westborough, MA",
    when: "Sun · 2:00 – 4:00 PM",
    band: [3.0, 5.0],
    formats: ["Singles"],
    spots: 4,
    capacity: 12,
    fee: 45,
    /* A coaching session is not a competition — nothing here moves a rating, and
       the card says so rather than letting a player assume it does. */
    rated: false,
    distance: 201,
  },
  {
    id: "e7",
    kind: "league",
    name: "Collegiate Ladder — Fall",
    host: "Northeast Collegiate Badminton",
    city: "Boston, MA",
    when: "Sep 1 – Nov 20",
    band: [4.5, 7.0],
    formats: ["Singles", "Doubles"],
    spots: 22,
    capacity: 64,
    fee: 0,
    rated: true,
    distance: 215,
  },
  {
    id: "e8",
    kind: "open-play",
    name: "Thursday Advanced Session",
    host: "Kotofit Flushing",
    city: "Flushing, NY",
    when: "Thu · 8:00 – 11:00 PM",
    band: [5.0, 6.5],
    formats: ["Doubles", "Mixed"],
    spots: 0,
    capacity: 32,
    fee: 25,
    rated: true,
    distance: 5.8,
  },
  {
    id: "e9",
    kind: "tournament",
    name: "Chicago Winter Classic",
    host: "Chicago Badminton Club",
    city: "Chicago, IL",
    when: "Nov 21 – 23",
    band: null,
    formats: ["Singles", "Doubles", "Mixed"],
    spots: 41,
    capacity: 160,
    fee: 60,
    rated: true,
    distance: 790,
  },
  {
    id: "e10",
    kind: "open-play",
    name: "Sunday Social Doubles",
    host: "Texas Badminton Academy",
    city: "Plano, TX",
    when: "Sun · 4:00 – 7:00 PM",
    band: [2.0, 4.5],
    formats: ["Doubles", "Mixed"],
    spots: 9,
    capacity: 28,
    fee: 15,
    rated: true,
    distance: 1552,
  },
  {
    id: "e11",
    kind: "league",
    name: "Kotofit JC Ladder",
    host: "Kotofit JC",
    city: "Jersey City, NJ",
    when: "Wed · Ongoing",
    band: [3.5, 5.0],
    formats: ["Singles"],
    spots: 7,
    capacity: 20,
    fee: 40,
    rated: true,
    distance: 9.2,
  },
  {
    id: "e12",
    kind: "clinic",
    name: "Junior Development Squad",
    host: "Seattle Smash Badminton",
    city: "Seattle, WA",
    when: "Sat · 10:00 AM – 12:00 PM",
    band: null,
    formats: ["Singles", "Doubles"],
    spots: 5,
    capacity: 16,
    fee: 35,
    rated: false,
    distance: 2405,
  },
];

/** Is this event open to the given rating? An unrated player can enter anything
    that has no band — that is what an open event is for. */
export function eligible(e: BadmintonEvent, rating: number | null): boolean {
  if (!e.band) return true;
  if (rating === null) return false;
  return rating >= e.band[0] && rating <= e.band[1];
}

/* ── Filters ──────────────────────────────────────────────────────────────── */

export const EVENT_DISTANCE_MAX = 3000;

export type EventFilters = {
  q: string;
  /** "all" is the absence of a filter, not a fifth kind. */
  kind: EventKind | "all";
  /** Miles. 0 = no limit — a universal rating means Milpitas counts, so the
      default cannot be "nearby". */
  distance: number;
  formats: string[];
  /** Only events my rating actually qualifies for. */
  qualifyOnly: boolean;
  /** Only events that move my rating. Excludes clinics. */
  ratedOnly: boolean;
  /** Only free entry. */
  freeOnly: boolean;
  /** Hide events with no spots left. */
  hideFull: boolean;
};

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  q: "",
  kind: "all",
  distance: 0,
  formats: [],
  qualifyOnly: false,
  ratedOnly: false,
  freeOnly: false,
  hideFull: false,
};

/** How many clauses are actually narrowing the list. Drives the badge on the
    Filter button, so it must count only what NARROWS — `kind: "all"` and
    `distance: 0` are the absence of a filter and must not be counted. */
export function activeEventFilterCount(f: EventFilters): number {
  let n = 0;
  if (f.kind !== "all") n++;
  if (f.distance > 0) n++;
  if (f.formats.length > 0) n++;
  if (f.qualifyOnly) n++;
  if (f.ratedOnly) n++;
  if (f.freeOnly) n++;
  if (f.hideFull) n++;
  return n;
}

export function filterEvents(
  f: EventFilters,
  rating: number | null,
  events: BadmintonEvent[] = EVENTS,
): BadmintonEvent[] {
  /* Name, host AND city. Nobody remembers the title of the thing they went to
     last month — they remember it was the Flushing one, or that Empire ran it. */
  const term = f.q.trim().toLowerCase();

  return events
    .filter(
      (e) =>
        !term ||
        e.name.toLowerCase().includes(term) ||
        e.host.toLowerCase().includes(term) ||
        e.city.toLowerCase().includes(term),
    )
    .filter((e) => f.kind === "all" || e.kind === f.kind)
    .filter((e) => f.distance === 0 || e.distance <= f.distance)
    .filter(
      (e) =>
        f.formats.length === 0 ||
        e.formats.some((fmtName) => f.formats.includes(fmtName.toLowerCase())),
    )
    .filter((e) => !f.qualifyOnly || eligible(e, rating))
    .filter((e) => !f.ratedOnly || e.rated)
    .filter((e) => !f.freeOnly || e.fee === 0)
    .filter((e) => !f.hideFull || e.spots > 0)
    .sort((a, b) => a.distance - b.distance);
}

export function fmtFee(fee: number): string {
  return fee === 0 ? "Free" : `$${fee}`;
}

export function fmtBand(band: [number, number] | null): string {
  return band ? `${band[0].toFixed(1)} – ${band[1].toFixed(1)}` : "Open to all";
}

/** Distances are shown in the unit a human would use, not always in miles. */
export function fmtDistance(miles: number): string {
  return miles < 100 ? `${miles.toFixed(1)} mi` : `${Math.round(miles).toLocaleString()} mi`;
}
