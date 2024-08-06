import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "@/lib/prisma";
import { Lucia, Session, User } from "lucia";
import { GitHub } from "arctic";
import { cache } from "react";
import { cookies } from "next/headers";

// prisma adapter which is required by lucia
const primsaAdapter = new PrismaAdapter(prisma.session, prisma.user);

// creating lucia instance
export const lucia = new Lucia(primsaAdapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      github_id: databaseUserAttributes.github_id,
      username: databaseUserAttributes.username,
      avatarUrl: databaseUserAttributes.avatarUrl,
      bio: databaseUserAttributes.bio,
      name: databaseUserAttributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  github_id: number;
  username: string;
  avatarUrl: string;
  bio: string;
  name: string;
}

// creating OAuth instance
export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!
);

// validating a session
export const validateRequest = cache(
  async (): Promise<
    { user: null; session: null } | { user: User; session: Session }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }

      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {}

    return result;
  }
);
