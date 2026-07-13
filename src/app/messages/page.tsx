"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/components/messages-store";
import { lastMessage, playerFor, type Thread } from "@/lib/messages";
import { fmt, levelFor } from "@/lib/dubr";
import { ChevronIcon, MessageIcon, PinIcon, PlusIcon, SendIcon } from "@/components/icons";

/**
 * The inbox.
 *
 * Two panes on desktop, one at a time on mobile — the list until you pick a
 * thread, the thread until you back out. A thread is always with a rated Player,
 * so the header carries the rating and level you would be playing: the message
 * is "want a game", and the number is how good a game it would be.
 *
 * Nothing is open by default. Opening a thread is what marks it read, so a page
 * that auto-opened the first one would silently eat an unread the moment you
 * landed here.
 */
export default function Messages() {
  const { threads, open, send } = useMessages();
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const thread = threads.find((t) => t.id === openId) ?? null;
  const log = useRef<HTMLDivElement>(null);

  /* Land at the newest message, not the oldest — and stay there when one is sent. */
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [openId, thread?.messages.length]);

  const select = (id: string) => {
    setOpenId(id);
    open(id);
    setDraft("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !thread) return;
    send(thread.id, text);
    setDraft("");
  };

  return (
    <div className="stack">
      <header className="page-head rise">
        <h1 className="page-title display">Messages</h1>
        <p className="page-sub">Every conversation here is one court booking away from a match.</p>
      </header>

      <div className={`inbox rise ${thread ? "is-open" : ""}`} style={{ animationDelay: "60ms" }}>
        {/* ── THREAD LIST ─────────────────────────────────────────────────── */}
        <ul className="card inbox__list">
          {threads.map((t) => {
            const p = playerFor(t);
            const last = lastMessage(t);
            const active = t.id === openId;
            return (
              <li key={t.id}>
                <button
                  onClick={() => select(t.id)}
                  aria-current={active ? "true" : undefined}
                  className={`convo ${active ? "is-active" : ""} ${t.unread ? "is-unread" : ""}`}
                >
                  <span className="avatar-initials avatar-initials--lg">{p.initials}</span>

                  <span className="convo__body">
                    <span className="convo__top">
                      <span className="convo__name">{p.name}</span>
                      <span className="convo__when">{t.when}</span>
                    </span>
                    <span className="convo__preview">
                      {last.author === "me" && <span className="convo__you">You: </span>}
                      {last.text}
                    </span>
                  </span>

                  {t.unread > 0 && (
                    <span className="convo__unread" aria-label={`${t.unread} unread`}>
                      {t.unread}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* ── OPEN THREAD ─────────────────────────────────────────────────── */}
        {thread ? (
          <Conversation
            key={thread.id}
            thread={thread}
            draft={draft}
            onDraft={setDraft}
            onSubmit={submit}
            onBack={() => setOpenId(null)}
            logRef={log}
          />
        ) : (
          <section className="card thread thread--empty">
            <MessageIcon className="thread__empty-icon" />
            <p>Pick a conversation.</p>
          </section>
        )}
      </div>
    </div>
  );
}

function Conversation({
  thread,
  draft,
  onDraft,
  onSubmit,
  onBack,
  logRef,
}: {
  thread: Thread;
  draft: string;
  onDraft: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  logRef: React.RefObject<HTMLDivElement | null>;
}) {
  const other = playerFor(thread);

  return (
    <section className="card thread">
      <header className="thread__head">
        {/* Only on mobile, where the list and the thread share one column. */}
        <button onClick={onBack} className="thread__back" aria-label="Back to inbox">
          <ChevronIcon />
        </button>

        <span className="avatar-initials avatar-initials--lg">{other.initials}</span>

        <div className="thread__who">
          <div className="thread__name">{other.name}</div>
          <div className="thread__meta">
            <PinIcon />
            <span>{other.location}</span>
          </div>
        </div>

        {/* The rating IS the context of the conversation — it is the difference
            between a warm-up and a real game, and it is the reason this app has
            an inbox at all. */}
        <div className="thread__rating">
          <div className="figure thread__figure">{fmt(other.singles)}</div>
          <div className="label">
            {other.singles === null ? "Unrated" : levelFor(other.singles).name}
          </div>
        </div>

        <Link href="/log" className="btn btn--ghost thread__log">
          <PlusIcon />
          Log a match
        </Link>
      </header>

      <div className="thread__scroll" ref={logRef}>
        {thread.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.author === "me" ? "is-mine" : ""}`}>
            <div className="bubble__text">{m.text}</div>
            <div className="bubble__at">{m.at}</div>
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <input
          className="composer__input"
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder={`Message ${other.name.split(" ")[0]}`}
          aria-label="Message"
        />
        <button type="submit" className="composer__send" disabled={!draft.trim()} aria-label="Send">
          <SendIcon />
        </button>
      </form>
    </section>
  );
}
