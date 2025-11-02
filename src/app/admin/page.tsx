"use client";

import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";

export default function AdminPage() {
  const { user } = useUser();
  const ADMIN_ID = "user_34crwM9NKJw8zMvnvIHKWaB2cqQ"; // ton ID Clerk admin

  return (
    <>
      <SignedIn>
        {user?.id === ADMIN_ID ? (
          <main className="p-6">
            <h1 className="text-2xl font-bold">👑 Espace Administrateur</h1>
            <p>Bienvenue dans la zone admin sécurisée.</p>
          </main>
        ) : (
          <div className="p-6 text-red-600 font-semibold">
            ❌ Accès refusé — vous n’êtes pas admin.
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
