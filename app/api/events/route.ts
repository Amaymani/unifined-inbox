import { addClient, removeClient } from "@/lib/sse";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const id = crypto.randomUUID();
  let closed = false; // track if the stream has ended

  const stream = new ReadableStream({
    start(controller) {
      addClient(id, controller);
      console.log("📡 SSE connected:", id);

      const safeEnqueue = (data: string) => {
        if (closed) return; // don’t write if stream closed
        try {
          controller.enqueue(data);
        } catch (err) {
          console.warn("⚠️ SSE enqueue failed, closing:", err);
          cleanup();
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        removeClient(id);
        try {
          controller.close();
        } catch {}
        console.log("🔌 SSE closed:", id);
      };

      // Send initial connection event
      safeEnqueue(`event: connected\ndata: "listening"\n\n`);

      // Keep-alive pings
      const interval = setInterval(() => {
        safeEnqueue(`event: keepalive\ndata: "ping"\n\n`);
      }, 30000);

      // Handle abort (Next.js sometimes doesn’t support signal)
      try {
        (controller as any).signal?.addEventListener("abort", cleanup);
      } catch {}

      // Fallback: auto cleanup after 24h
      setTimeout(cleanup, 24 * 60 * 60 * 1000);
    },
    cancel() {
      closed = true;
      removeClient(id);
      console.log("🔌 SSE cancelled:", id);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
