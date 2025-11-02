import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className="bg-black text-white">
          <header className="flex justify-between items-center p-4 bg-black text-white">
            <Link href="/" className="font-bold text-xl">Conformy</Link>
            <div className="flex gap-6 items-center">
              <Link href="/pricing" className="hover:underline">
                Pricing
              </Link>
              <SignedIn>
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
