"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Inbox from "@/components/Inbox";
import Composer from "@/components/Composer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await authClient.getSession();
      console.log("Dashboard session:", res);
      if (!res?.data?.user) router.push("/login?redirect=/dashboard");
      else {
        setSession(res.data);
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback>
              {session.user?.email?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">Unified Inbox</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as {session.user?.email}
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <Button variant="secondary" onClick={() => router.push("/analytics")}>
  View Analytics
</Button>

      <Card className="shadow-sm border">
        <CardContent className="pt-6">
          <Composer />
        </CardContent>
      </Card>

      <div className="mt-8">
        <Inbox />
      </div>
    </div>
  );
}
