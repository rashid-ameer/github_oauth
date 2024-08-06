import { validateRequest } from "@/auth";
import Signout from "@/components/signout-button";
import Image from "next/image";

export default async function Home() {
  const { user } = await validateRequest();

  if (!user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-5">
      <div className="bg-white shadow-md rounded-xl p-4 min-w-64 space-y-5 max-w-80 text-center relative">
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={100}
          height={100}
          className="rounded-full border-3 border-black mx-auto"
        />

        <div className="">
          <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-sm">@{user.username}</p>
        </div>

        <p className="text-gray-700">{user.bio}</p>
      </div>
      <Signout />
    </main>
  );
}
