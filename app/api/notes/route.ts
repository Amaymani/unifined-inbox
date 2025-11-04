import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const noteSchema = z.object({
  threadId: z.string(),
  content: z.string().min(1),
  isPrivate: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const { user, session: userSession } = await auth.api.getSession({ headers: req.headers }) || {};
    if (!user || !userSession) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = noteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        threadId: parsed.threadId,
        authorId: user.id,
        content: parsed.content,
        isPrivate: parsed.isPrivate ?? false,
      },
      include: { author: true },
    });

    return NextResponse.json(note);
  } catch (err: any) {
    console.error("Error creating note:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const threadId = url.searchParams.get("threadId");
  if (!threadId) return new Response("Missing threadId", { status: 400 });

  const notes = await prisma.note.findMany({
    where: { threadId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}
