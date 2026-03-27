import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: isDev ? { strategy: "jwt" } : undefined,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      from: process.env.EMAIL_FROM ?? "noreply@bangla-learn.com",
    }),
    ...(isDev
      ? [
          Credentials({
            id: "dev-login",
            name: "Dev Login",
            credentials: {},
            async authorize() {
              let user = await db.user.findUnique({
                where: { email: "dev@bangla-learn.local" },
              });
              if (!user) {
                user = await db.user.create({
                  data: {
                    email: "dev@bangla-learn.local",
                    name: "Dev User",
                    emailVerified: new Date(),
                  },
                });
              }
              return user;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token, user }) {
      if (token?.id) {
        session.user.id = token.id as string;
      } else if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
