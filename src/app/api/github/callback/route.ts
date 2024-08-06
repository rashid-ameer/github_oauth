import { github, lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state");
  const code = req.nextUrl.searchParams.get("code");

  const storedState = cookies().get("state")?.value ?? null;

  if (!state || !code || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const gitHubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    const gitHubUser: GitHubUser = await gitHubUserResponse.json();

    // check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: {
        github_id: gitHubUser.id,
      },
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/", // redirect to home page
        },
      });
    }

    const userId = generateIdFromEntropySize(10); // 16 characters long

    await prisma.user.create({
      data: {
        id: userId,
        github_id: gitHubUser.id,
        username: gitHubUser.login,
        name: gitHubUser.name,
        avatarUrl: gitHubUser.avatar_url,
        bio: gitHubUser.bio,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/", // redirect to home page
      },
    });
  } catch (error) {
    if (error instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }

    return new Response(null, {
      status: 500,
    });
  }
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
}
