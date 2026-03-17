import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conformy — Conformité juridique de votre site",
  description: "Vérifiez en 30 secondes si votre site respecte le RGPD, les mentions légales et la législation française. Audit IA dès 4,99 €.",
  openGraph: {
    title: "Conformy — Conformité juridique de votre site",
    description: "Audit RGPD & mentions légales par IA en 30 secondes. Dès 4,99 €.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conformy — Conformité juridique de votre site",
    description: "Audit RGPD & mentions légales par IA en 30 secondes. Dès 4,99 €.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style={{ fontFamily: "'DM Sans', sans-serif", margin: 0, backgroundColor: "#06060a" }}>

          {/* ── Navbar ── */}
          <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "rgba(6,6,10,0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}>
            <div style={{
              maxWidth: "1200px", margin: "0 auto",
              padding: "0 24px", height: "64px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>

              {/* Logo */}
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Icône balance */}
                <div style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="2" y1="5" x2="14" y2="5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="2" y1="5" x2="2" y2="8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                    <line x1="14" y1="5" x2="14" y2="8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M0 8 Q2 10.5 4 8" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    <path d="M12 8 Q14 10.5 16 8" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    <line x1="6.5" y1="14" x2="9.5" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700, fontSize: "18px", color: "#f5f4f0", letterSpacing: "-0.02em",
                }}>Conformy</span>
              </Link>

              {/* Right side */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Link href="/pricing" style={{
                  color: "rgba(255,255,255,0.5)", textDecoration: "none",
                  fontSize: "14px", fontWeight: 500, padding: "8px 14px", borderRadius: "8px",
                  transition: "color 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Tarifs
                </Link>

                <SignedIn>
                  <Link href="/dashboard" style={{
                    color: "rgba(255,255,255,0.5)", textDecoration: "none",
                    fontSize: "14px", fontWeight: 500, padding: "8px 14px", borderRadius: "8px",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Dashboard
                  </Link>
                  <div style={{ marginLeft: "8px" }}>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button style={{
                      marginLeft: "8px",
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: "#fff", border: "none", cursor: "pointer",
                      padding: "9px 20px", borderRadius: "9px",
                      fontSize: "14px", fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: "0 0 24px rgba(124,58,237,0.3)",
                      transition: "box-shadow 0.2s",
                    }}>
                      Connexion
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </nav>

          <main style={{ paddingTop: "64px" }}>
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}