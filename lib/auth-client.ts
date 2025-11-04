// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";

// Detect absolute URL dynamically (works on both server and client)
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser
    return window.location.origin + "/api/auth";
  }

  // Server (Next.js SSR)
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth`
    : "http://localhost:3000/api/auth";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  fetchOptions: {
    credentials: "include", 
  },
});
