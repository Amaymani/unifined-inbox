// app/api/webhooks/twilio/route.ts
import { prisma } from "@/lib/db";

import { broadcast } from "@/lib/sse";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const form = new URLSearchParams(rawBody);

  const fromRaw = form.get("From") ?? "";
  const to = form.get("To") ?? "";
  const body = form.get("Body") ?? "";
  const smsSid = form.get("SmsSid") ?? form.get("MessageSid");
  const numMedia = Number(form.get("NumMedia") ?? "0");

  const isWhatsApp = fromRaw.startsWith("whatsapp:");
  const from = fromRaw.replace("whatsapp:", "");
  const channel = isWhatsApp ? "WHATSAPP" : "SMS";

  // ✅ Upsert contact
  const contact = await prisma.contact.upsert({
    where: { phone: from },
    update: { updatedAt: new Date() },
    create: { phone: from },
  });

  // ✅ Find or create thread
  let thread =
    (await prisma.thread.findFirst({ where: { contactId: contact.id } })) ??
    (await prisma.thread.create({ data: { contactId: contact.id } }));

  // ✅ Handle media if present
  let mediaUrl: string | null = null;
  if (numMedia > 0) {
    const media = form.get("MediaUrl0");
    if (media) mediaUrl = media.toString();
  }

  // ✅ Create inbound message
  const message = await prisma.message.create({
    data: {
      threadId: thread.id,
      direction: "INBOUND",
      channel,
      body,
      mediaUrl,
      providerMsgId: smsSid ?? undefined,
      from,
      to,
    },
  });
  console.log("📤 New message saved:", message.id);

  // ✅ STEP 2 — broadcast the new message to all SSE listeners
  console.log("📡 Broadcasting new-message event...");
  broadcast("new-message", {
  id: message.id,
  threadId: thread.id,
  from,
  to,
  body,
  channel,
  direction: "INBOUND",
  createdAt: message.createdAt,
});

  return new Response("OK", { status: 200 });
}
