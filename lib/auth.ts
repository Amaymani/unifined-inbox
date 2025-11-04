// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

interface Credentials {
  email: string;
  password: string;
  name?: string;
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,

    register: async ({ email, password, name }: Credentials) => {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return { error: "User already exists" };

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: { email, name, password: hashedPassword },
      });

      return { user: newUser };
    },

    authorize: async ({ email, password }: Credentials) => {
      try {
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
      } catch (error) {
        console.error("❌ Error in authorize():", error);
        return null;
      }
    },
  },

  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      options: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        domain: undefined
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },

  pages: {
    signIn: "/login",
  },
});
