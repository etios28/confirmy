"use client"; // 👈 très important ici

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  const { user } = useUser();
  const ADMIN_ID = "user_34crwM9NKJw8zMvnvIHKWaB2cqQ"; // 👈 ton vrai ID admin Clerk

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 bg-black text-white">
      <Link href="/" className="font-bold text-xl">Conformy</Link>

      <div className="flex gap-4 items-center">
        <SignedIn>
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>

          {user?.id === ADMIN_ID && (
            <Link href="/admin" className="text-sm hover:underline text-purple-600">
              Admin 👑
            </Link>
          )}

          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
    </header>
  );
}
