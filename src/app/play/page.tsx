import { CalendarIcon, PinIcon, ShuttleIcon } from "@/components/icons";

/**
 * Open Play. The old app shipped this as a bare "Coming soon" line on an empty
 * screen, which reads as an unfinished build rather than a deliberate state. A
 * pre-launch screen should still show the shape of the thing.
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
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Open Play</h1>
        <p className="page-sub">
          Rated sessions. Everything you play here counts toward your DUBR.
        </p>
      </header>

      <ul className="grid-cards grid-cards--three">
        {SESSIONS.map((s, i) => {
          const full = s.spots === 0;
          return (
            <li
              key={s.venue}
              className="card rise"
              style={{ animationDelay: `${40 + i * 40}ms`, overflow: "hidden" }}
            >
              <div className="session__top">
                <div className="session__day display">{s.day}</div>

                <div className="session__body">
                  <div className="session__venue">{s.venue}</div>
                  <div className="player-card__meta">
                    <PinIcon />
                    <span>{s.location}</span>
                  </div>
                </div>

                <span className={`session__spots ${full ? "is-full" : ""}`}>
                  {full ? "Full" : `${s.spots} spots`}
                </span>
              </div>

              {/* The three facts that decide whether you show up. */}
              <div className="facts">
                <Fact label="Time" value={s.time} />
                <Fact label="DUBR Band" value={s.band} />
                <Fact label="Courts" value={String(s.courts)} />
              </div>

              <div className="session__action">
                <button disabled={full} className="btn btn--primary btn--block">
                  {full ? "Join waitlist" : "Reserve a spot"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="card card--pad rise" style={{ animationDelay: "200ms" }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <ShuttleIcon />
          <div>
            <div>Booking opens with the Flushing launch</div>
            <p className="provisional__note">
              Sessions are banded by DUBR so you get games worth playing. Reserve now and you keep
              your spot when courts go live.
            </p>
          </div>
        </div>
      </section>

      <div className="row footnote">
        <CalendarIcon className="search__icon" />
        Times shown in your local timezone.
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <div className="label">{label}</div>
      <div className="fact__value">{value}</div>
    </div>
  );
}
