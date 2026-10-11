import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authSecret } from "./data/db/connection.js";
import { findUserByEmail } from "./data/repositories/users.js";
import { verifyPassword } from "./data/auth/password.js";
import { allowLogin, clearAttempts } from "./data/auth/attempts.js";

export const { handlers, auth } = NextAuth({
  secret: authSecret,
  trustHost: process.env.NODE_ENV !== "production" || Boolean(process.env.AUTH_URL),
  pages: { signIn: "/login" }, session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (typeof credentials.email !== "string" || typeof credentials.password !== "string" ||
          credentials.email.length > 254 || credentials.password.length > 128) return null;
      const email = credentials.email.trim().toLowerCase();
      if (!await allowLogin(email)) return null;
      const user = await findUserByEmail(email);
      const valid = await verifyPassword(credentials.password, user?.password);
      if (!user || !valid) return null;
      await clearAttempts(email);
      return { id: user.id, email, role: user.role, sessionVersion: user.sessionVersion };
    },
  })],
  callbacks: {
    jwt({ token, user }) {
      if (user) Object.assign(token, { role: user.role, sessionVersion: user.sessionVersion });
      return token;
    },
    session({ session, token }) {
      Object.assign(session.user, { id: token.sub, role: token.role, sessionVersion: token.sessionVersion });
      return session;
    },
  },
});