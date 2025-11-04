"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard"; // default

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) router.push(redirect);
    })();
  }, [router, redirect]);

 const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔑 ensures cookie is stored
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    // Optional: delay to allow cookie to be stored
    await new Promise((r) => setTimeout(r, 300));

    router.push(redirect);
  } catch (err) {
    console.error(err);
    setError("Invalid credentials or network issue");
  } finally {
    setLoading(false);
  }
};



  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/sign-in/google?redirect=${encodeURIComponent(
      redirect
    )}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white shadow-md p-8 rounded-xl w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white w-full py-2 rounded">
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-3 w-full border py-2 rounded text-gray-700"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
