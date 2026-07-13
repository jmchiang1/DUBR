import { CalendarIcon, PinIcon, ShuttleIcon } from "@/components/icons";

/**
 * Open Play. The old app shipped this as a bare "Coming soon — find and join
 * open play sessions." on an otherwise empty black screen, which reads as an
 * unfinished build rather than a deliberate state. A pre-launch screen should
 * still show the shape of the thing and give the user something to do.
 */

const SESSIONS = [
  {
    venue: "Kotofit LIC",
    location: "Long Island City, NY",
    day: "Tue",
    time: "7:00 – 10:00 PM",
    band: "4.5 – 6.0",
    courts: 6,
    spots: 3,
  },
  {
    venue: "Kotofit Flushing",
    location: "Flushing, NY",
    day: "Thu",
    time: "8:00 – 11:00 PM",
    band: "5.0 – 6.5",
    courts: 8,
    spots: 0,
  },
  {
    venue: "Kotofit JC",
    location: "Jersey City, NJ",
    day: "Sat",
    time: "10:00 AM – 1:00 PM",
    band: "3.5 – 5.0",
    courts: 4,
    spots: 7,
  },
];

export default function OpenPlay() {
  return (
    <div className="space-y-3">
      <header className="rise">
        <div className="flex items-center gap-2">
          <h1 className="display canvas-fg text-[26px]">Open Play</h1>
          <span className="label rounded-[4px] border border-line bg-elevated px-1.5 py-1 !text-[8px] !text-mute">
            Preview
          </span>
        </div>
        <p className="canvas-mute mt-1.5 text-[13px]">
          Rated sessions. Everything you play here counts toward your DUBR.
        </p>
      </header>

      <ul className="space-y-3">
        {SESSIONS.map((s, i) => {
          const full = s.spots === 0;
          return (
            <li
              key={s.venue}
              className="rise overflow-hidden rounded-[14px] border border-line bg-surface"
              style={{ animationDelay: `${40 + i * 40}ms` }}
            >
              <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                {/* Day block — a calendar chit, set in the display face. */}
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-line bg-elevated">
                  <span className="display text-[13px] text-bone">{s.day}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-bone">{s.venue}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-faint">
                    <PinIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{s.location}</span>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-[8px] border px-2 py-1 text-[11px] font-medium ${
                    full
                      ? "border-line bg-elevated text-faint"
                      : "border-aqua/30 bg-aqua/10 text-aqua-ink"
                  }`}
                >
                  {full ? "Full" : `${s.spots} spots`}
                </span>
              </div>

              {/* The three facts that decide whether you show up. */}
              <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
                <Fact label="Time" value={s.time} />
                <Fact label="DUBR Band" value={s.band} />
                <Fact label="Courts" value={String(s.courts)} />
              </div>

              <div className="border-t border-line p-3">
                <button
                  disabled={full}
                  className="w-full rounded-[8px] bg-aqua py-2.5 text-[13px] font-semibold text-on-aqua transition-opacity hover:opacity-90 disabled:bg-elevated disabled:text-faint"
                >
                  {full ? "Join waitlist" : "Reserve a spot"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <section
        className="rise flex items-start gap-3 rounded-[14px] border border-line bg-surface px-4 py-4"
        style={{ animationDelay: "200ms" }}
      >
        <ShuttleIcon className="mt-0.5 h-5 w-5 shrink-0 text-faint" />
        <div>
          <div className="text-[13px] text-bone">Booking opens with the Flushing launch</div>
          <p className="mt-1 text-[12px] leading-relaxed text-faint">
            Sessions are banded by DUBR so you get games worth playing. Reserve now and you
            keep your spot when courts go live.
          </p>
        </div>
      </section>

      <div className="rise canvas-faint flex items-center gap-2 px-1 text-[11px]" style={{ animationDelay: "240ms" }}>
        <CalendarIcon className="h-3.5 w-3.5" />
        Times shown in your local timezone.
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3">
      <div className="label">{label}</div>
      <div className="mt-1.5 text-[12px] tabular-nums text-bone">{value}</div>
    </div>
  );
}
