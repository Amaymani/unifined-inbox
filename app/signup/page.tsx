"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useMounted } from "@/lib/hooks/use-mounted"; // ✅ imported hook


export default function SignupPage() {
  const router = useRouter();
  const mounted = useMounted(); // ✅ hydration-safe hook

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setError(error.message || "An error occurred");
    } else {
      alert("Signup successful!");
      router.push("/");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/sign-in/google";
  };

  // ✅ This prevents ANY SSR mismatch — nothing renders until hydrated
  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-[380px] border-none shadow-xl bg-white/5 backdrop-blur-lg text-white">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-300">
            Join the unified inbox platform today
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="my-6">
            <Separator className="bg-slate-700" />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full bg-white/10 hover:bg-white/20 border-slate-600 text-white"
          >
            
            Sign up with Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center text-slate-400 text-sm">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
