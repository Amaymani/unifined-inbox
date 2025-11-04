// app/api/webhooks/twilio/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const fromRaw = form.get("From")?.toString();
  const to = form.get("To")?.toString();
  const body = form.get("Body")?.toString() ?? "";
  const smsSid = form.get("SmsSid")?.toString() ?? form.get("MessageSid")?.toString();
  const numMedia = Number(form.get("NumMedia")?.toString() ?? "0");

  const isWhatsApp = !!fromRaw?.startsWith("whatsapp:");
  const from = fromRaw?.replace("whatsapp:", "") ?? fromRaw;

  const channel = isWhatsApp ? "WHATSAPP" : "SMS";

  // Upsert contact by phone
  const contact = await prisma.contact.upsert({
    where: { phone: from },
    update: { updatedAt: new Date() },
    create: { phone: from, name: null },
  });

  // find or create thread for contact
  let thread = await prisma.thread.findFirst({ where: { contactId: contact.id }});
  if (!thread) {
    thread = await prisma.thread.create({
      data: { contactId: contact.id },
    });
  }

  // handle media (if any)
  let mediaUrl: string | null = null;
  if (numMedia > 0) {
    // Twilio provides MediaUrl0, MediaUrl1, ...
    const media = form.get("MediaUrl0")?.toString();
    if (media) mediaUrl = media;
  }

  const message = await prisma.message.create({
    data: {
      threadId: thread.id,
      direction: "INBOUND",
      channel,
      body,
      mediaUrl,
      providerMsgId: smsSid,
      from,
      to,
    },
  });

  // Optionally: broadcast via websocket / socket.io to clients (not included here)

  return NextResponse.json({ ok: true, messageId: message.id });
}
