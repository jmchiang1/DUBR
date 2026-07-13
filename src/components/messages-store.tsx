"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { THREADS, unreadCount, type Thread } from "@/lib/messages";

/**
 * One copy of the inbox, shared by the rail and the page.
 *
 * The unread badge lives in the sidebar and the thing that CLEARS it lives on
 * /messages. Reading the module constant from both would let them disagree —
 * the badge still claiming 3 unread while you sit in the thread you just read.
 * A badge that lies about unread is worse than no badge, so both read the same
 * state here.
 *
 * This is deliberately not a persistence layer. Reload and the mock is back.
 */

type Store = {
  threads: Thread[];
  unread: number;
  /** Opening a thread marks it read. */
  open: (id: string) => void;
  send: (id: string, text: string) => void;
};

const MessagesContext = createContext<Store | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>(THREADS);

  const open = useCallback((id: string) => {
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  }, []);

  const send = useCallback((id: string, text: string) => {
    setThreads((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              when: "Now",
              messages: [
                ...t.messages,
                { id: `${id}m${t.messages.length + 1}`, author: "me" as const, text, at: "Now" },
              ],
            }
          : t,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ threads, unread: unreadCount(threads), open, send }),
    [threads, open, send],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages(): Store {
  const store = useContext(MessagesContext);
  if (!store) throw new Error("useMessages must be used inside <MessagesProvider>");
  return store;
}
