"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ScanDetails = {
  mentions_legales: boolean;
  politique_confidentialite: boolean;
  bandeau_cookies: boolean;
  cgv_cgu: boolean;
  donnees_personnelles: boolean;
  droit_rectification: boolean;
  droit_oubli: boolean;
  portabilite_donnees: boolean;
  duree_conservation: boolean;
  sous_traitants: boolean;
  dpo_contact: boolean;
  https_securise: boolean;
  securite_mdp: boolean;
};

const CHECKS: { key: keyof ScanDetails; label: string; desc: string; pts: number; category: "obligatoire" | "rgpd" | "securite" }[] = [
  { key: "mentions_legales",          label: "Mentions légales",               desc: "Éditeur, hébergeur, SIRET/RCS (LCEN)",         pts: 15, category: "obligatoire" },
  { key: "politique_confidentialite", label: "Politique de confidentialité",   desc: "Base légale, droits, traitements (RGPD)",       pts: 15, category: "obligatoire" },
  { key: "bandeau_cookies",           label: "Bandeau cookies",                desc: "Consentement & refus avant dépôt (ePrivacy)",   pts: 12, category: "obligatoire" },
  { key: "cgv_cgu",                   label: "CGV / CGU",                      desc: "Obligatoire pour e-commerce et SaaS",           pts: 10, category: "obligatoire" },
  { key: "donnees_personnelles",      label: "Données personnelles",           desc: "Traitement et base légale identifiés",          pts:  8, category: "rgpd" },
  { key: "droit_rectification",       label: "Droit de rectification",         desc: "Article 16 RGPD — modifier ses données",       pts:  5, category: "rgpd" },
  { key: "droit_oubli",               label: "Droit à l'oubli",                desc: "Article 17 RGPD — demander la suppression",    pts:  5, category: "rgpd" },
  { key: "portabilite_donnees",       label: "Portabilité des données",        desc: "Article 20 RGPD — récupérer ses données",      pts:  5, category: "rgpd" },
  { key: "duree_conservation",        label: "Durée de conservation",          desc: "Délai de rétention précisé dans la politique", pts:  5, category: "rgpd" },
  { key: "sous_traitants",            label: "Sous-traitants & transferts UE", desc: "Liste des tiers, pays hors Union Européenne",  pts:  5, category: "rgpd" },
  { key: "dpo_contact",               label: "DPO / Contact données",          desc: "Délégué à la protection des données",          pts:  5, category: "rgpd" },
  { key: "https_securise",            label: "HTTPS / Sécurité transport",     desc: "Chiffrement TLS actif sur l'ensemble du site", pts:  5, category: "securite" },
  { key: "securite_mdp",              label: "Politique de sécurité",          desc: "Mots de passe, chiffrement, sécurité données", pts:  5, category: "securite" },
];

const CATEGORY_LABELS = {
  obligatoire: { label: "Obligations légales", color: "#7c3aed" },
  rgpd:        { label: "RGPD & Droits",        color: "#3b82f6" },
  securite:    { label: "Sécurité",             color: "#0ea5e9" },
};

export default function WebsiteReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [site, setSite]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/website?id=${id}`)
      .then(r => r.json())
      .then(d => { setSite(d.website); setLoading(false); });
  }, [id]);

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pdf-report?id=${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur PDF");
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "conformy_rapport.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#06060a", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
      Chargement du rapport…
    </div>
  );

  if (!site) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#06060a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", gap: "16px" }}>
      <p>Site introuvable.</p>
      <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
        Retour
      </button>
    </div>
  );

  const report    = site.report ? JSON.parse(site.report) : {};
  const details: ScanDetails = report.details ?? {};
  const note: number  = report.note_conformite ?? 0;
  const confiance: number = report.confiance_analyse ?? 0;

  const okCount  = CHECKS.filter(c => details[c.key]).length;
  const totalPts = CHECKS.reduce((s, c) => s + (details[c.key] ? c.pts : 0), 0);

  const scoreColor = note >= 60 ? "#4ade80" : note >= 30 ? "#fbbf24" : "#f87171";
  const scoreLabel = note >= 60 ? "Conforme" : note >= 30 ? "Partiellement conforme" : "Non conforme";

  return (
    <>
      <style>{`
        .check-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; transition: border-color 0.2s; }
        .check-card:hover { border-color: rgba(255,255,255,0.12); }
        .check-ok   { border-left: 3px solid rgba(74,222,128,0.5) !important; }
        .check-fail { border-left: 3px solid rgba(248,113,113,0.4) !important; }
        .section-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; font-family: 'DM Sans', sans-serif; margin: 0; }
        .reco-card { background: rgba(124,58,237,0.07); border: 1px solid rgba(124,58,237,0.15); border-radius: 12px; padding: 16px; display: flex; gap: 12px; align-items: flex-start; }
        @media (max-width: 640px) {
          .checks-grid  { grid-template-columns: 1fr !important; }
          .summary-grid { grid-template-columns: 1fr 1fr !important; }
          .page-pad     { padding: 20px 16px 60px !important; }
          .score-block  { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", backgroundColor: "#06060a", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="page-pad" style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 32px 80px" }}>

          {/* Retour */}
          <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", marginBottom: "28px" }}>
            ← Dashboard
          </button>

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <p className="section-label" style={{ color: "rgba(124,58,237,0.8)", marginBottom: "8px" }}>Rapport d'audit</p>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#f5f4f0", marginBottom: "4px" }}>
                  {site.url}
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
                  Scanné le {new Date(site.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  {report.pages_scannees?.length > 1 && ` · ${report.pages_scannees.length} pages analysées`}
                </p>
              </div>
              <button onClick={handleDownloadPDF} disabled={downloading} style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", border: "none", cursor: "pointer", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", opacity: downloading ? 0.6 : 1, boxShadow: "0 0 20px rgba(124,58,237,0.3)", whiteSpace: "nowrap" }}>
                {downloading ? "Génération…" : "Télécharger PDF"}
              </button>
            </div>
          </div>

          {/* Score + métriques */}
          <div className="score-block" style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px 28px", display: "flex", alignItems: "center", gap: "20px", flex: "1 1 240px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: `3px solid ${scoreColor}`, background: `${scoreColor}18`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{note}</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>/100</span>
              </div>
              <div>
                <p style={{ fontSize: "18px", fontWeight: 700, color: scoreColor, marginBottom: "4px", fontFamily: "'Playfair Display', serif" }}>{scoreLabel}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{okCount}/{CHECKS.length} points validés · {totalPts} pts</p>
                <div style={{ marginTop: "10px", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", width: "160px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${note}%`, borderRadius: "3px", background: scoreColor, transition: "width 0.8s ease" }} />
                </div>
              </div>
            </div>

            <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", flex: "1 1 300px" }}>
              {[
                { label: "Validés",   value: okCount,                  color: "#4ade80" },
                { label: "Manquants", value: CHECKS.length - okCount,  color: "#f87171" },
                { label: "Confiance", value: `${confiance}%`,          color: "#c4b5fd" },
              ].map(m => (
                <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: m.color, marginBottom: "4px" }}>{m.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyse IA */}
          {report.commentaires && (
            <div style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)", borderLeft: "3px solid rgba(124,58,237,0.5)", borderRadius: "14px", padding: "20px 20px 20px 24px", marginBottom: "28px" }}>
              <p className="section-label" style={{ color: "rgba(124,58,237,0.8)", marginBottom: "10px" }}>Analyse IA</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, margin: 0 }}>{report.commentaires}</p>
            </div>
          )}

          {/* Points par catégorie */}
          {(["obligatoire", "rgpd", "securite"] as const).map(cat => {
            const catChecks = CHECKS.filter(c => c.category === cat);
            const catOk = catChecks.filter(c => details[c.key]).length;
            const { label, color } = CATEGORY_LABELS[cat];
            return (
              <div key={cat} style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <p className="section-label" style={{ color: `${color}cc` }}>{label}</p>
                  </div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{catOk}/{catChecks.length}</span>
                </div>
                <div className="checks-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {catChecks.map(check => {
                    const ok = details[check.key] ?? false;
                    return (
                      <div key={check.key} className={`check-card ${ok ? "check-ok" : "check-fail"}`}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: ok ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: ok ? "#4ade80" : "#f87171" }}>{ok ? "✓" : "✗"}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: ok ? "#f5f4f0" : "rgba(255,255,255,0.5)", marginBottom: "2px" }}>{check.label}</p>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", lineHeight: 1.4, margin: 0 }}>{check.desc}</p>
                        </div>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>{check.pts} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Recommandations */}
          {report.recommandations?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <p className="section-label" style={{ color: "rgba(124,58,237,0.8)", marginBottom: "12px" }}>Recommandations prioritaires</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {report.recommandations.map((r: string, i: number) => (
                  <div key={i} className="reco-card">
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#c4b5fd" }}>{i + 1}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pages scannées */}
          {report.pages_scannees?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "14px 16px" }}>
              <p className="section-label" style={{ color: "rgba(255,255,255,0.25)", marginBottom: "8px" }}>Pages scannées</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {report.pages_scannees.map((p: string, i: number) => (
                  <span key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "100px", padding: "3px 10px", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                    {p.replace(/^https?:\/\/[^/]+/, "") || "/"}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}