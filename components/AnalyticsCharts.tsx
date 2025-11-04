"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AnalyticsCharts({ data }: { data: any }) {
  const { channelStats, dailyData, threadStatus, avgResponse } = data;

  return (
    <div className="space-y-8">
      {/* Channel Volume */}
      <Card>
        <CardHeader><CardTitle>Messages per Channel</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card>
        <CardHeader><CardTitle>Message Activity (Last 7 Days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Thread Status + Avg Response */}
      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {threadStatus.map((s: any) => (
            <div key={s.status} className="text-center border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{s.status}</p>
              <p className="text-2xl font-semibold">{s._count.status}</p>
            </div>
          ))}
          <div className="col-span-2 md:col-span-1 text-center border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Avg Response (min)</p>
            <p className="text-2xl font-semibold">{avgResponse}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
