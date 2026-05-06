import { streamSource } from "@/lib/stream-source";
import { historyStore } from "@/lib/history-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const current = streamSource.getCurrent();
      if (current) send("now-playing", current);
      send("history-updated", historyStore.list().slice(0, 5));

      const unsubscribe = streamSource.subscribe((data) => {
        send("now-playing", data);
        send("history-updated", historyStore.list().slice(0, 5));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 25000);

      return () => {
        unsubscribe();
        clearInterval(heartbeat);
      };
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
