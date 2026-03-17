import * as cheerio from "cheerio";

// ── Types ──────────────────────────────────────────────────────────────────

export type ScanDetails = {
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

export type ScanResult = {
  status: "compliant" | "non_compliant";
  report: {
    foundKeywords: string[];
    note_conformite: number;
    commentaires: string;
    details: ScanDetails;
    recommandations: string[];
    pages_scannees: string[];
    confiance_analyse: number;
  };
};

// ── Chemins légaux standards ───────────────────────────────────────────────

const LEGAL_PATHS = [
  "/mentions-legales", "/mentions-legales.html", "/mentions_legales",
  "/legal", "/legal.html", "/informations-legales",
  "/politique-de-confidentialite", "/politique-confidentialite",
  "/confidentialite", "/privacy", "/privacy-policy", "/rgpd",
  "/cgv", "/cgu", "/conditions-generales",
  "/conditions-generales-de-vente", "/conditions-generales-utilisation",
  "/cookies", "/gestion-cookies", "/dpo", "/contact",
];

const KEYWORDS = [
  "mentions légales", "politique de confidentialité", "cookies",
  "rgpd", "données personnelles", "cgv", "cgu", "droit de rectification",
  "droit à l'oubli", "suppression des données", "portabilité",
  "durée de conservation", "sous-traitant", "transfert hors ue",
  "délégué à la protection", "dpo", "https", "chiffrement",
];

// ── Fetch texte d'une page ─────────────────────────────────────────────────

async function fetchPageText(url: string): Promise<{ text: string; links: string[] }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ConformyBot/2.0; +https://conformy.vercel.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { text: "", links: [] };

    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, svg, img, video, audio").remove();

    // Liens internes vers pages légales
    const links: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const txt = $(el).text().toLowerCase().trim();
      if (
        href.startsWith("/") &&
        (txt.includes("mention") || txt.includes("légal") || txt.includes("legal") ||
         txt.includes("confidential") || txt.includes("privacy") || txt.includes("cookie") ||
         txt.includes("rgpd") || txt.includes("cgv") || txt.includes("cgu") ||
         txt.includes("condition") || txt.includes("dpo") || txt.includes("protection") ||
         txt.includes("données"))
      ) {
        links.push(href);
      }
    });

    // Aria-labels (bandeaux cookies JS)
    const extras: string[] = [];
    $("[aria-label], [title]").each((_, el) => {
      const v = $(el).attr("aria-label") || $(el).attr("title") || "";
      if (v.length > 4) extras.push(v);
    });

    const body = $("body").text().replace(/\s+/g, " ").trim();
    const combined = [body, ...extras].join(" ").slice(0, 12000);
    return { text: combined, links };
  } catch {
    return { text: "", links: [] };
  }
}

// ── Scan principal ─────────────────────────────────────────────────────────

export async function scanUrl(url: string): Promise<ScanResult> {
  const base = url.replace(/\/$/, "");
  const httpsOk = base.startsWith("https://");

  // 1. Homepage
  const homepage = await fetchPageText(base);
  const isSPA = homepage.text.trim().length < 400;

  // 2. Découvrir les URLs légales
  const legalUrls = new Set<string>();
  for (const link of homepage.links) {
    if (link.startsWith("http")) legalUrls.add(link);
    else if (link.startsWith("/")) legalUrls.add(base + link);
  }
  for (const path of LEGAL_PATHS) legalUrls.add(base + path);

  // 3. Scanner les pages légales en parallèle
  const urlsToScan = Array.from(legalUrls).slice(0, 12);
  const scannedPages: string[] = [base];
  const allTexts: string[] = [homepage.text];

  const results = await Promise.allSettled(urlsToScan.map(u => fetchPageText(u)));
  urlsToScan.forEach((pageUrl, i) => {
    const r = results[i];
    if (r.status === "fulfilled" && r.value.text.trim().length > 80) {
      scannedPages.push(pageUrl);
      allTexts.push(r.value.text);
    }
  });

  // 4. Texte combiné + mots-clés
  const texteComplet = allTexts.join("\n\n---\n\n").slice(0, 22000);
  const lowerTexte = texteComplet.toLowerCase();
  const foundKeywords = KEYWORDS.filter(k => lowerTexte.includes(k.toLowerCase()));

  // 5. Analyse IA
  const spaNote = isSPA
    ? "\n⚠️ SPA détectée (React/Next.js) : texte potentiellement incomplet. Sois indulgent et cherche des indices dans les URLs et fragments disponibles."
    : "";

  const prompt = `Tu es un expert juridique senior en conformité des sites web français (RGPD, CNIL, LCEN, directive ePrivacy).

Site : ${url}
Pages analysées (${scannedPages.length}) : ${scannedPages.slice(0, 6).join(" | ")}
HTTPS sur l'URL principale : ${httpsOk ? "OUI" : "NON"}
${spaNote}

CONTENU EXTRAIT :
${texteComplet}

Évalue la conformité sur 13 points précis. Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "note_conformite": <0-100>,
  "mentions_legales": <bool>,
  "politique_confidentialite": <bool>,
  "bandeau_cookies": <bool>,
  "cgv_cgu": <bool>,
  "donnees_personnelles": <bool>,
  "droit_rectification": <bool>,
  "droit_oubli": <bool>,
  "portabilite_donnees": <bool>,
  "duree_conservation": <bool>,
  "sous_traitants": <bool>,
  "dpo_contact": <bool>,
  "https_securise": <bool>,
  "securite_mdp": <bool>,
  "commentaires": "<3-4 phrases : points présents, manquants, risques CNIL>",
  "recommandations": ["<action 1>", "<action 2>", "<action 3>", "<action 4>"],
  "confiance_analyse": <0-100>
}

Barème (100 pts) :
- Mentions légales LCEN (éditeur, hébergeur, SIRET) : 15 pts
- Politique de confidentialité RGPD : 15 pts
- Bandeau cookies ePrivacy (refus possible) : 12 pts
- CGV/CGU (e-commerce ou SaaS) : 10 pts
- Données personnelles & base légale : 8 pts
- Droit de rectification : 5 pts
- Droit à l'oubli/suppression : 5 pts
- Portabilité des données : 5 pts
- Durée de conservation précisée : 5 pts
- Sous-traitants & transferts hors UE : 5 pts
- DPO / contact dédié : 5 pts
- HTTPS sur l'ensemble du site : 5 pts
- Sécurité (mots de passe, chiffrement) : 5 pts`;

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      const raw = aiData.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        const p = JSON.parse(match[0]);
        const note = Math.min(100, Math.max(0, p.note_conformite ?? 0));
        return {
          status: note >= 60 ? "compliant" : "non_compliant",
          report: {
            foundKeywords,
            note_conformite: note,
            commentaires: p.commentaires ?? "",
            details: {
              mentions_legales:          p.mentions_legales ?? false,
              politique_confidentialite: p.politique_confidentialite ?? false,
              bandeau_cookies:           p.bandeau_cookies ?? false,
              cgv_cgu:                   p.cgv_cgu ?? false,
              donnees_personnelles:      p.donnees_personnelles ?? false,
              droit_rectification:       p.droit_rectification ?? false,
              droit_oubli:               p.droit_oubli ?? false,
              portabilite_donnees:       p.portabilite_donnees ?? false,
              duree_conservation:        p.duree_conservation ?? false,
              sous_traitants:            p.sous_traitants ?? false,
              dpo_contact:               p.dpo_contact ?? false,
              https_securise:            p.https_securise ?? httpsOk,
              securite_mdp:              p.securite_mdp ?? false,
            },
            recommandations: p.recommandations ?? [],
            pages_scannees: scannedPages,
            confiance_analyse: p.confiance_analyse ?? 50,
          },
        };
      }
    }
  } catch (e) {
    console.error("Erreur IA, fallback basique:", e);
  }

  // Fallback
  const note = Math.round((foundKeywords.length / KEYWORDS.length) * 100);
  return {
    status: note >= 60 ? "compliant" : "non_compliant",
    report: {
      foundKeywords,
      note_conformite: note,
      commentaires: "Analyse limitée — contenu insuffisant extrait. Vérifiez manuellement les pages légales.",
      details: {
        mentions_legales:          lowerTexte.includes("mentions légales"),
        politique_confidentialite: lowerTexte.includes("politique de confidentialité"),
        bandeau_cookies:           lowerTexte.includes("cookies"),
        cgv_cgu:                   lowerTexte.includes("cgv") || lowerTexte.includes("cgu"),
        donnees_personnelles:      lowerTexte.includes("données personnelles"),
        droit_rectification:       lowerTexte.includes("droit de rectification"),
        droit_oubli:               lowerTexte.includes("oubli") || lowerTexte.includes("suppression"),
        portabilite_donnees:       lowerTexte.includes("portabilité"),
        duree_conservation:        lowerTexte.includes("conservation"),
        sous_traitants:            lowerTexte.includes("sous-traitant"),
        dpo_contact:               lowerTexte.includes("dpo") || lowerTexte.includes("délégué"),
        https_securise:            httpsOk,
        securite_mdp:              lowerTexte.includes("mot de passe"),
      },
      recommandations: [
        "Ajouter des mentions légales complètes (éditeur, hébergeur, SIRET/RCS)",
        "Rédiger une politique de confidentialité RGPD avec base légale de chaque traitement",
        "Installer un bandeau cookies conforme permettant le refus avant dépôt de traceurs",
        "Désigner un DPO ou indiquer un contact dédié à la protection des données",
      ],
      pages_scannees: scannedPages,
      confiance_analyse: 20,
    },
  };
}