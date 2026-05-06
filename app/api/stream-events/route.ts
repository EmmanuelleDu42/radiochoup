import { streamSource } from "@/lib/stream-source";
import { historyStore } from "@/lib/history-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  let unsubscribe: (() => void) | null = null;
  let heartbeat: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // controller closed — ignore
        }
      };

      const current = streamSource.getCurrent();
      if (current) send("now-playing", current);
      send("history-updated", historyStore.list().slice(0, 5));

      unsubscribe = streamSource.subscribe((data) => {
        send("now-playing", data);
        send("history-updated", historyStore.list().slice(0, 5));
      });

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          // ignore
        }
      }, 25000);
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
