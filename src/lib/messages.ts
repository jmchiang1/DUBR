/**
 * Messages.
 *
 * A badminton app's inbox is not a social feed — it is how a game gets ARRANGED.
 * Every thread here is with a real Player from the directory, so the rating,
 * club, and level shown in the inbox are the same numbers the rest of the app
 * uses. That is the whole point: "can I get a game with this person, and is it
 * a game worth having" is one question, and the answer needs both halves.
 */

import { PLAYERS, type Player } from "./dubr";

export type Message = {
  id: string;
  /** Who said it. "me" is the account holder. */
  author: "me" | "them";
  text: string;
  /**
   * A display string, not a Date. The mock has to render identically on the
   * server and on the client, and a relative time computed from `Date.now()`
   * cannot promise that — it is the classic hydration mismatch. When these
   * become real messages this is an ISO timestamp formatted at the edge.
   */
  at: string;
};

export type Thread = {
  id: string;
  /** The other person. Always a Player, never a free-floating name. */
  playerId: string;
  /** How many of `messages` the account holder has not read. */
  unread: number;
  /** When the last message landed. Shown on the list row. */
  when: string;
  /** Oldest first. */
  messages: Message[];
};

export const THREADS: Thread[] = [
  {
    id: "t1",
    playerId: "p6", // Sarah Tanaka — doubles partner
    unread: 2,
    when: "2:14 PM",
    messages: [
      {
        id: "t1m1",
        author: "them",
        text: "That third game was the best we've played together.",
        at: "Yesterday 9:02 PM",
      },
      {
        id: "t1m2",
        author: "me",
        text: "The 21–16 close was all you. I was gassed by 15.",
        at: "Yesterday 9:20 PM",
      },
      {
        id: "t1m3",
        author: "them",
        text: "Court 3 at Kotofit LIC is free Tuesday 7pm. Same slot as last week.",
        at: "2:11 PM",
      },
      {
        id: "t1m4",
        author: "them",
        text: "If we take two off Brian and Owen we're both through 5.5 as a pair.",
        at: "2:14 PM",
      },
    ],
  },
  {
    id: "t2",
    playerId: "p2", // Kevin Cheng
    unread: 1,
    when: "11:40 AM",
    messages: [
      {
        id: "t2m1",
        author: "me",
        text: "Rematch? You're up 2–1 on me this month and I'd like that back.",
        at: "Yesterday 6:31 PM",
      },
      {
        id: "t2m2",
        author: "them",
        text: "Singles ladder, Thursday. Jersey City, 8pm. Bring the good shuttles.",
        at: "11:40 AM",
      },
    ],
  },
  {
    id: "t3",
    playerId: "p3", // Brian Law
    unread: 0,
    when: "Tue",
    messages: [
      {
        id: "t3m1",
        author: "them",
        text: "Good game Tuesday. Your net game got a lot sharper.",
        at: "Tue 10:12 PM",
      },
      {
        id: "t3m2",
        author: "me",
        text: "Cheers — that clear you hit at 19-all is still following me around.",
        at: "Tue 10:30 PM",
      },
      {
        id: "t3m3",
        author: "them",
        text: "Open play Sunday if you want it back.",
        at: "Tue 10:31 PM",
      },
    ],
  },
  {
    id: "t4",
    playerId: "p1", // Mecream Osathanugrah — well above me
    unread: 0,
    when: "Jul 5",
    messages: [
      {
        id: "t4m1",
        author: "me",
        text: "Any chance of a hit sometime? I know you're 0.8 above me.",
        at: "Jul 5, 4:02 PM",
      },
      {
        id: "t4m2",
        author: "them",
        text: "Happy to. Play up — it's the fastest way to move. Flushing most Saturdays.",
        at: "Jul 5, 5:47 PM",
      },
    ],
  },
  {
    id: "t5",
    playerId: "p7", // Owen Zhang
    unread: 0,
    when: "Jun 28",
    messages: [
      {
        id: "t5m1",
        author: "them",
        text: "Logged our match — check the score before it settles.",
        at: "Jun 28, 8:15 PM",
      },
      { id: "t5m2", author: "me", text: "Confirmed. 21-12, 21-15. Good game.", at: "Jun 28, 8:22 PM" },
    ],
  },
];

export function playerFor(thread: Thread): Player {
  const p = PLAYERS.find((x) => x.id === thread.playerId);
  if (!p) throw new Error(`Thread ${thread.id} points at unknown player ${thread.playerId}`);
  return p;
}

/** The last message is what the list row previews. A thread is never empty. */
export function lastMessage(thread: Thread): Message {
  return thread.messages[thread.messages.length - 1];
}

export function unreadCount(threads: Thread[]): number {
  return threads.reduce((n, t) => n + t.unread, 0);
}
