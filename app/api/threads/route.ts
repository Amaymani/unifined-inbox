// app/api/threads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const threads = await prisma.thread.findMany({
    include: {
      contact: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const formatted = threads.map((t) => ({
    id: t.id,
    contact: t.contact,
    latestMessage: t.messages[0] ?? null,
    status: t.status,
    updatedAt: t.updatedAt,
  }));

  return NextResponse.json(formatted);
}
