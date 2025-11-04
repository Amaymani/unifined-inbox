import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createSender } from "@/lib/integrations";

const bodySchema = z.object({
  to: z.string().min(6),
  body: z.string().optional(),
  threadId: z.string().optional(),
  mediaUrl: z.string().optional(),
  channel: z.enum(["sms", "whatsapp"]).default("sms"),
});

export async function POST(req: Request) {
  try {
    const { user, session: userSession } = await auth.api.getSession({ headers: req.headers }) || {};

if (!user || !userSession) {
  return new Response("Unauthorized", { status: 401 });
}


    const payload = await req.json();
    const parsed = bodySchema.parse(payload);
    const channel = parsed.channel.toUpperCase();

    const sender = createSender(parsed.channel);
    const sid = await sender.send({
      to: parsed.to,
      body: parsed.body,
      mediaUrl: parsed.mediaUrl,
    });

    const contact = await prisma.contact.upsert({
      where: { phone: parsed.to },
      update: { updatedAt: new Date() },
      create: { phone: parsed.to },
    });

    const thread =
      parsed.threadId
        ? await prisma.thread.findUnique({ where: { id: parsed.threadId } })
        : (await prisma.thread.findFirst({ where: { contactId: contact.id } })) ??
          (await prisma.thread.create({ data: { contactId: contact.id } }));

    const message = await prisma.message.create({
      data: {
        threadId: thread!.id,
        to: parsed.to,
        from: user.email,
        direction: "OUTBOUND",
        body: parsed.body,
        mediaUrl: parsed.mediaUrl,
        channel,
        providerMsgId: sid,
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
