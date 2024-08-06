import GithubIcon from "@/components/github-icon";

function page() {
  return (
    <main className="h-screen flex items-center justify-center">
      <a
        href="/login/github"
        className="bg-gray-800 text-white px-4 py-2 rounded-full flex items-center gap-3">
        <GithubIcon className="size-6" />
        Sign in with Github
      </a>
    </main>
  );
}
export default page;
