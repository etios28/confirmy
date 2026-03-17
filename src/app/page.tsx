import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50%       { transform: rotate(-3deg) translateY(-10px); }
        }
        .anim-1 { animation: fadeUp 0.7s ease both; }
        .anim-2 { animation: fadeUp 0.7s 0.12s ease both; }
        .anim-3 { animation: fadeUp 0.7s 0.22s ease both; }
        .anim-4 { animation: fadeUp 0.7s 0.32s ease both; }
        .anim-5 { animation: fadeUp 0.7s 0.42s ease both; }
        .mockup-float { animation: float 6s ease-in-out infinite; }

        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(38px, 6vw, 80px);
          font-weight: 700;
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: #f5f4f0;
          margin: 0 0 28px;
        }
        .gradient-text {
          background: linear-gradient(120deg, #c4b5fd 0%, #818cf8 40%, #c4b5fd 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; text-decoration: none;
          padding: 15px 30px; border-radius: 10px;
          font-size: 15px; font-weight: 600;
          box-shadow: 0 0 40px rgba(124,58,237,0.35);
          transition: box-shadow 0.2s, transform 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .cta-primary:hover { box-shadow: 0 0 60px rgba(124,58,237,0.55); transform: translateY(-2px); }
        .cta-secondary {
          display: inline-flex; align-items: center;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65); text-decoration: none;
          padding: 15px 28px; border-radius: 10px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.03);
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .cta-secondary:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); }

        .feature-card {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px;
          background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          transition: border-color 0.25s, transform 0.25s;
        }
        .feature-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-3px); }

        .step-number {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px;
          border: 1px solid rgba(124,58,237,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #a78bfa;
          background: rgba(124,58,237,0.08);
          font-family: 'DM Sans', sans-serif;
        }
        .section-label {
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(124,58,237,0.8); font-weight: 600;
          font-family: 'DM Sans', sans-serif;
        }
        .trust-badge {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 100px; padding: 5px 14px;
          background: rgba(124,58,237,0.07);
          font-size: 12px; color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        /* Responsive */
        @media (max-width: 768px) {
          .hero-inner { flex-direction: column !important; }
          .hero-mockup { display: none !important; }
          .hero-text { max-width: 100% !important; }
          .stats-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
          .cta-buttons a { justify-content: center; text-align: center; }
          .section-pad { padding: 70px 20px !important; }
          .hero-pad { padding: 60px 20px 80px !important; }
          .footer-inner { flex-direction: column; gap: 16px; text-align: center; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", backgroundColor: "#06060a", color: "#f5f4f0", overflow: "hidden" }}>

        {/* Ambient lights */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-15%", right: "5%", width: "700px", height: "700px", background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 65%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "5%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 65%)", borderRadius: "50%" }} />
          {/* Texture grille */}
          <img
            src="/images/hero-texture.svg"
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, mixBlendMode: "screen" }}
          />
        </div>

        {/* ── HERO ── */}
        <section className="hero-pad" style={{ position: "relative", zIndex: 1, padding: "100px 48px 120px", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="hero-inner" style={{ display: "flex", alignItems: "center", gap: "60px" }}>

            {/* Texte */}
            <div className="hero-text" style={{ flex: "1 1 0", minWidth: 0 }}>
              <div className="anim-1 trust-badge" style={{ marginBottom: "36px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block", flexShrink: 0 }} />
                RGPD · Mentions légales · Droit français
              </div>

              <h1 className="hero-title anim-2">
                Votre site est-il<br />
                <span className="gradient-text">juridiquement protégé ?</span>
              </h1>

              <p className="anim-3" style={{
                fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.75,
                color: "rgba(245,244,240,0.5)", maxWidth: "500px",
                marginBottom: "44px", fontWeight: 300, fontFamily: "'DM Sans', sans-serif",
              }}>
                Conformy audite votre site en moins de 30 secondes. Mentions légales, RGPD, cookies, CGV — chaque manquement détecté, chaque risque expliqué.
              </p>

              <div className="anim-4 cta-buttons" style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "40px" }}>
                <Link href="/pricing" className="cta-primary">
                  Auditer mon site
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/dashboard" className="cta-secondary">
                  Voir le dashboard
                </Link>
              </div>

              <p className="anim-5" style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>
                Utilisé par des agences web, freelances et e-commerçants pour rester conformes sans juriste.
              </p>
            </div>

            {/* Mockup flottant */}
            <div className="hero-mockup anim-3" style={{ flexShrink: 0, width: "340px" }}>
              <div className="mockup-float">
                <img
                  src="/images/report-mockup.svg"
                  alt="Exemple de rapport Conformy"
                  style={{ width: "100%", height: "auto", filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(124,58,237,0.2))" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="section-pad" style={{
          position: "relative", zIndex: 1, padding: "52px 48px",
          borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)",
          maxWidth: "1200px", margin: "0 auto",
        }}>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px", textAlign: "center" }}>
            {[
              { value: "4,99 €",  sub: "Audit unique, sans abonnement" },
              { value: "< 30 s",  sub: "Résultat immédiat, IA incluse" },
              { value: "6 points", sub: "de contrôle légaux vérifiés" },
            ].map((s) => (
              <div key={s.sub}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#f5f4f0", marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="section-pad" style={{ position: "relative", zIndex: 1, padding: "110px 48px", maxWidth: "1200px", margin: "0 auto" }}>
          <p className="section-label" style={{ textAlign: "center", display: "block", marginBottom: "14px" }}>Ce qu'on vérifie</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px", textAlign: "center", color: "#f5f4f0" }}>
            Un audit complet, pas une checklist superficielle
          </h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.38)", fontSize: "16px", maxWidth: "520px", margin: "0 auto 56px", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            Notre IA lit votre site comme un juriste : elle comprend le contexte, repère les absences et formule des recommandations concrètes.
          </p>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { icon: "⚖️", title: "Mentions légales",       desc: "Éditeur, hébergeur, SIRET — les obligations de la LCEN vérifiées à la lettre." },
              { icon: "🔐", title: "RGPD & confidentialité", desc: "Politique de traitement, base légale, droits des personnes concernées." },
              { icon: "🍪", title: "Gestion des cookies",    desc: "Bandeau de consentement, refus effectif, conformité à la directive ePrivacy." },
              { icon: "📋", title: "CGV / CGU",              desc: "Conditions générales obligatoires pour tout site e-commerce ou SaaS." },
              { icon: "🔔", title: "Alertes automatiques",   desc: "Dès qu'une régression est détectée, vous êtes averti avant d'être en infraction." },
              { icon: "🤖", title: "Analyse par IA",         desc: "Claude analyse chaque page en profondeur — pas de faux positifs, pas de lacunes." },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div style={{ fontSize: "26px", marginBottom: "14px" }}>{f.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="section-pad" style={{ position: "relative", zIndex: 1, padding: "80px 48px", maxWidth: "1200px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="section-label" style={{ textAlign: "center", display: "block", marginBottom: "14px" }}>Comment ça marche</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "52px", textAlign: "center", color: "#f5f4f0" }}>
            Trois étapes, zéro friction
          </h2>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
            {[
              { n: "01", title: "Entrez votre URL",    desc: "Collez l'adresse de votre site. Aucune installation, aucun plugin requis." },
              { n: "02", title: "L'IA analyse",        desc: "Notre moteur lit le contenu de votre site et l'évalue sur 6 points juridiques clés." },
              { n: "03", title: "Recevez le rapport",  desc: "Note de conformité, détail des manquements, recommandations actionnables." },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", gap: "20px" }}>
                <div className="step-number">{step.n}</div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#f5f4f0", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>{step.title}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="section-pad" style={{ position: "relative", zIndex: 1, padding: "80px 48px 100px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            border: "1px solid rgba(124,58,237,0.2)", borderRadius: "20px",
            padding: "clamp(44px, 6vw, 80px) clamp(24px, 5vw, 64px)",
            background: "linear-gradient(145deg, rgba(124,58,237,0.07) 0%, rgba(79,70,229,0.04) 100%)",
            textAlign: "center",
          }}>
            <p className="section-label" style={{ display: "block", marginBottom: "14px" }}>Commencer maintenant</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px", color: "#f5f4f0" }}>
              Êtes-vous vraiment en conformité ?
            </h2>
            <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.42)", marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              La CNIL peut sanctionner votre site sans préavis. Un audit à 4,99 € aujourd'hui peut vous éviter des milliers d'euros de pénalités.
            </p>
            <Link href="/pricing" className="cta-primary" style={{ fontSize: "16px", padding: "17px 36px" }}>
              Lancer mon audit — dès 4,99 €
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 48px" }}>
          <div className="footer-inner" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>© 2026 Conformy — Tous droits réservés</span>
            <div style={{ display: "flex", gap: "24px" }}>
              {[["Tarifs", "/pricing"], ["Dashboard", "/dashboard"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>{label}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}