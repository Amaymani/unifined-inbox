import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const threads = await prisma.thread.findMany({
      include: {
        contact: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(threads);
  } catch (err: any) {
    console.error("Error fetching threads:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
