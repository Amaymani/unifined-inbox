import Link from "next/link";
import { prisma } from "@/lib/db";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function AnalyticsPage() {
  // --- same Prisma queries as before ---
  const channelStatsRaw = await prisma.message.groupBy({
    by: ["channel"],
    _count: { channel: true },
  });
  const channelStats = channelStatsRaw.map((c) => ({
    name: c.channel,
    count: c._count.channel,
  }));

  const last7days = await prisma.message.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true },
  });
  const dailyCounts: Record<string, number> = {};
  last7days.forEach((m) => {
    const d = format(m.createdAt, "MMM d");
    dailyCounts[d] = (dailyCounts[d] ?? 0) + 1;
  });
  const dailyData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  const threads = await prisma.thread.findMany({
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  const times: number[] = [];
  for (const t of threads) {
    const i = t.messages.find((m) => m.direction === "INBOUND");
    const o = t.messages.find((m) => m.direction === "OUTBOUND");
    if (i && o) times.push((o.createdAt.getTime() - i.createdAt.getTime()) / 1000 / 60);
  }
  const avgResponse = times.length
    ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)
    : "N/A";

  const threadStatus = await prisma.thread.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return (
    <div className="p-6">
      <Link href="/dashboard">
        <Button variant="secondary" className="mb-4">
          Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-3xl font-semibold mb-6">Analytics Dashboard</h1>
      <AnalyticsCharts
        data={{ channelStats, dailyData, threadStatus, avgResponse }}
      />
    </div>
  );
}
