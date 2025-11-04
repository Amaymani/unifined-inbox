"use client";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const session = await authClient.getSession();
      console.log("Fetched session:", session);

      if (!session) {
        router.replace("/login"); 
        return;
      }
      const userFromSession = session.data?.user ?? null;
      setUser(userFromSession);
      setLoading(false);
    }

    fetchSession();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return <div>Hello, {user?.name}</div>;
}
