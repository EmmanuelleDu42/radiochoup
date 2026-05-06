"use client";

import { useEffect, useState } from "react";
import type { HistoryEntry } from "@/lib/types";

export function useHistory(limit = 5): HistoryEntry[] {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const source = new EventSource("/api/stream-events");

    source.addEventListener("history-updated", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as HistoryEntry[];
        setHistory(payload.slice(0, limit));
      } catch {
        // ignore
      }
    });

    return () => source.close();
  }, [limit]);

  return history;
}
