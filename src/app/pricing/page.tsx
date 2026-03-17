"use client";

import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function PricingPage() {
  const [scanUrl, setScanUrl] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur paiement.");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error("❌ " + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.6s ease both; }
        .anim-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .anim-3 { animation: fadeUp 0.6s 0.2s ease both; }

        .plan-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 32px 28px;
          background: linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          display: flex; flex-direction: column;
          transition: border-color 0.25s, transform 0.25s;
          position: relative;
        }
        .plan-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-4px); }
        .plan-card-featured {
          border-color: rgba(124,58,237,0.45) !important;
          background: linear-gradient(160deg, rgba(124,58,237,0.1) 0%, rgba(79,70,229,0.05) 100%) !important;
          box-shadow: 0 0 60px rgba(124,58,237,0.12);
        }
        .plan-btn {
          width: 100%; border: none; cursor: pointer;
          padding: 14px; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
        }
        .plan-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .plan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .plan-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; box-shadow: 0 0 28px rgba(124,58,237,0.35);
        }
        .plan-btn-secondary {
          background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .feature-line {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: rgba(255,255,255,0.55);
          line-height: 1.5; padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .feature-line:last-child { border-bottom: none; }
        .section-label {
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(124,58,237,0.8); font-weight: 600;
          font-family: 'DM Sans', sans-serif;
        }
        .pill {
          display: inline-flex; align-items: center;
          background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.2);
          border-radius: 100px; padding: 3px 10px;
          font-size: 11px; color: #c4b5fd;
        }
        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .page-pad { padding: 60px 20px 80px !important; }
          .faq-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .pricing-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", backgroundColor: "#06060a", color: "#f5f4f0" }}>
        <Toaster position="bottom-right" toastOptions={{ style: { background: "#1a1a2e", color: "#f5f4f0", border: "1px solid rgba(255,255,255,0.1)" } }} />

        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-10%", right: "10%", width: "600px", height: "600px", background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 65%)", borderRadius: "50%" }} />
        </div>

        <div className="page-pad" style={{ position: "relative", zIndex: 1, maxWidth: "1120px", margin: "0 auto", padding: "80px 48px 100px" }}>

          {/* Header */}
          <div className="anim-1" style={{ textAlign: "center", marginBottom: "64px" }}>
            <p className="section-label" style={{ marginBottom: "16px" }}>Tarifs transparents</p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#f5f4f0", marginBottom: "16px",
            }}>
              Choisissez votre niveau<br />de protection
            </h1>
            <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.4)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Un audit ponctuel ou une surveillance continue — sans engagement inutile, sans frais cachés.
            </p>
          </div>

          {/* Plans grid */}
          <div className="anim-2 pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "80px" }}>

            {/* Starter */}
            <div className="plan-card">
              <div style={{ marginBottom: "28px" }}>
                <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>Starter</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: 700, color: "#f5f4f0", lineHeight: 1 }}>4,99</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", marginBottom: "6px" }}>€</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Paiement unique</p>
              </div>
              <div style={{ flex: 1, marginBottom: "24px" }}>
                {[[true,"1 site audité"],[true,"Rapport IA immédiat"],[true,"Note de conformité /100"],[false,"Historique des scans"],[false,"Alertes email automatiques"],[false,"Rescans planifiés"]].map(([ok, label], i) => (
                  <div key={i} className="feature-line">
                    <span style={{ color: ok ? "#a78bfa" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>{ok ? "✓" : "–"}</span>
                    <span style={{ color: ok ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{label as string}</span>
                  </div>
                ))}
              </div>
              <input
                type="url" placeholder="https://votre-site.com"
                value={scanUrl} onChange={(e) => setScanUrl(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", marginBottom: "10px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "9px", padding: "11px 14px",
                  color: "#f5f4f0", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none",
                }}
              />
              <button onClick={() => handleCheckout("SCAN_UNIQUE")} disabled={checkoutLoading === "SCAN_UNIQUE"} className="plan-btn plan-btn-secondary">
                {checkoutLoading === "SCAN_UNIQUE" ? "Redirection…" : "Payer 4,99 € et auditer"}
              </button>
            </div>

            {/* Pro */}
            <div className="plan-card plan-card-featured">
              <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "100px", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>RECOMMANDÉ</div>
              <div style={{ marginBottom: "28px" }}>
                <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(167,139,250,0.7)", marginBottom: "10px" }}>Pro</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: 700, color: "#f5f4f0", lineHeight: 1 }}>19</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", marginBottom: "6px" }}>€ / mois</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Résiliable à tout moment</p>
              </div>
              <div style={{ flex: 1, marginBottom: "24px" }}>
                {[[true,"Jusqu'à 10 sites surveillés"],[true,"Rescans hebdomadaires automatiques"],[true,"Alertes email en cas de régression"],[true,"Historique complet des rapports"],[true,"Téléchargement PDF"],[false,"Alertes Slack"]].map(([ok, label], i) => (
                  <div key={i} className="feature-line">
                    <span style={{ color: ok ? "#a78bfa" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>{ok ? "✓" : "–"}</span>
                    <span style={{ color: ok ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{label as string}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleCheckout("PRO")} disabled={checkoutLoading === "PRO"} className="plan-btn plan-btn-primary">
                {checkoutLoading === "PRO" ? "Redirection…" : "Démarrer avec Pro"}
              </button>
            </div>

            {/* Business */}
            <div className="plan-card">
              <div style={{ marginBottom: "28px" }}>
                <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>Business</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: 700, color: "#f5f4f0", lineHeight: 1 }}>49</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", marginBottom: "6px" }}>€ / mois</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Résiliable à tout moment</p>
              </div>
              <div style={{ flex: 1, marginBottom: "24px" }}>
                {[[true,"Sites illimités"],[true,"Rescans quotidiens automatiques"],[true,"Alertes email + Slack"],[true,"Rapports PDF détaillés"],[true,"Support prioritaire"],[true,"Analyse IA approfondie"]].map(([ok, label], i) => (
                  <div key={i} className="feature-line">
                    <span style={{ color: ok ? "#a78bfa" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>{ok ? "✓" : "–"}</span>
                    <span style={{ color: ok ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{label as string}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleCheckout("BUSINESS")} disabled={checkoutLoading === "BUSINESS"} className="plan-btn plan-btn-secondary">
                {checkoutLoading === "BUSINESS" ? "Redirection…" : "Passer à Business"}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="anim-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "64px" }}>
            <p className="section-label" style={{ textAlign: "center", marginBottom: "14px" }}>Questions fréquentes</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px,2.5vw,32px)", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", marginBottom: "40px", color: "#f5f4f0" }}>Ce que vous voulez savoir</h2>
            <div className="faq-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px" }}>
              {[
                { q: "Dois-je installer quelque chose ?", r: "Non. Conformy fonctionne entièrement en ligne. Vous entrez une URL, l'analyse démarre immédiatement." },
                { q: "L'audit remplace-t-il un avis juridique ?", r: "Non. Conformy détecte les manquements courants mais ne constitue pas un conseil juridique." },
                { q: "Que se passe-t-il après l'audit Starter ?", r: "Vous obtenez un rapport complet consultable immédiatement. Aucune donnée sauvegardée, aucune relance." },
                { q: "Puis-je résilier à tout moment ?", r: "Oui. Plans Pro et Business sans engagement. Résiliation en un clic depuis votre espace Stripe." },
              ].map((item) => (
                <div key={item.q} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#f5f4f0", marginBottom: "8px" }}>{item.q}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{item.r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résultat scan */}
        {scanResult && (
          <div style={{ position: "relative", zIndex: 1, padding: "0 48px 80px", maxWidth: "1120px", margin: "0 auto" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", background: "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "18px", padding: "32px" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid rgba(124,58,237,0.4)", background: "rgba(124,58,237,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#c4b5fd", lineHeight: 1 }}>{scanResult.report?.note_conformite ?? "–"}</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>/100</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#f5f4f0", wordBreak: "break-all" }}>{scanResult.url}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "100px",
                      background: scanResult.status === "compliant" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: scanResult.status === "compliant" ? "#4ade80" : "#f87171",
                    }}>
                      {scanResult.status === "compliant" ? "Conforme" : "Non conforme"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{scanResult.report?.commentaires}</p>
                  {scanResult.report?.foundKeywords?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                      {scanResult.report.foundKeywords.map((kw: string, i: number) => (
                        <span key={i} className="pill">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}