import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    // ✅ Unwrap params Promise
    const { threadId } = await context.params;

    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err: any) {
    console.error("Error fetching messages:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
