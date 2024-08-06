"use client";
import { logout } from "@/actions/action";

function Signout() {
  return (
    <button
      className="px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
      onClick={async () => await logout()}>
      Sign out
    </button>
  );
}
export default Signout;
