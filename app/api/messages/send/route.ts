// app/api/messages/send/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createSender } from "@/lib/integrations"; // Twilio abstraction
import { authClient } from "@/lib/auth-client";

// ✅ Schema validation
const bodySchema = z.object({
  to: z.string().min(6),
  body: z.string().optional(),
  threadId: z.string().optional(),
  mediaUrl: z.string().optional(),
  channel: z.enum(["sms", "whatsapp"]).default("sms"),
});

export async function POST(req: Request) {
  try {
    // ✅ Authenticate user
    const session = await authClient.getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    // ✅ Validate request body
    const payload = await req.json();
    const parsed = bodySchema.parse(payload);

    // ✅ Get sender for Twilio (abstraction handles SMS vs WhatsApp)
    const sender = createSender(parsed.channel);

    // ✅ Send via Twilio (abstraction hides credentials & logic)
    const sid = await sender.send({
      to: parsed.to,
      body: parsed.body,
      mediaUrl: parsed.mediaUrl,
    });

    // ✅ Upsert contact
    const contact = await prisma.contact.upsert({
      where: { phone: parsed.to },
      update: { updatedAt: new Date() },
      create: { phone: parsed.to },
    });

    // ✅ Find or create thread
    const thread =
      parsed.threadId
        ? await prisma.thread.findUnique({ where: { id: parsed.threadId } })
        : (await prisma.thread.findFirst({ where: { contactId: contact.id } })) ??
          (await prisma.thread.create({ data: { contactId: contact.id } }));

    // ✅ Store message in DB
    const message = await prisma.message.create({
      data: {
        threadId: thread!.id,
        to: contact.id,
        from: session.data?.user.id,
        direction: "OUTBOUND",
        body: parsed.body,
        mediaUrl: parsed.mediaUrl,
      },
    });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
