import * as cheerio from "cheerio";

export type ScanResult = {
  status: "compliant" | "non_compliant";
  report: {
    foundKeywords: string[];
    note_conformite: number;
    commentaires: string;
    details: {
      mentions_legales: boolean;
      politique_confidentialite: boolean;
      bandeau_cookies: boolean;
      cgv_cgu: boolean;
      donnees_personnelles: boolean;
      droit_rectification: boolean;
    };
    recommandations: string[];
  };
};

export async function scanUrl(url: string): Promise<ScanResult> {
  // 1) Fetch HTML
  const res = await fetch(url, {
    headers: { "User-Agent": "ConformyBot/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Impossible d'accéder au site.");
  const html = await res.text();

  // 2) Extraire le texte visible avec cheerio
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe").remove();
  const texte = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

  // 3) Analyse basique (fallback)
  const keywords = [
    "mentions légales", "politique de confidentialité", "cookies",
    "rgpd", "données personnelles", "cgv", "cgu", "droit de rectification"
  ];
  const lowerTexte = texte.toLowerCase();
  const foundKeywords = keywords.filter((k) => lowerTexte.includes(k));

  // 4) Analyse IA avec Claude
  try {
    const prompt = `Tu es un expert juridique spécialisé en conformité légale des sites web français et européens (RGPD, loi Informatique et Libertés, directive ePrivacy, loi pour la confiance dans l'économie numérique).

Analyse ce texte extrait du site web "${url}" et évalue sa conformité légale.

TEXTE DU SITE :
${texte}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "note_conformite": <nombre entre 0 et 100>,
  "mentions_legales": <true/false>,
  "politique_confidentialite": <true/false>,
  "bandeau_cookies": <true/false>,
  "cgv_cgu": <true/false>,
  "donnees_personnelles": <true/false>,
  "droit_rectification": <true/false>,
  "commentaires": "<résumé en 2-3 phrases>",
  "recommandations": ["<recommandation 1>", "<recommandation 2>", "<recommandation 3>"]
}

Critères d'évaluation :
- Mentions légales obligatoires (éditeur, hébergeur, SIRET) : 20 pts
- Politique de confidentialité RGPD complète : 20 pts  
- Gestion des cookies conforme (bandeau, consentement) : 20 pts
- CGV/CGU si site e-commerce ou SaaS : 15 pts
- Droits des utilisateurs (accès, rectification, suppression) : 15 pts
- Données personnelles et base légale : 10 pts`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      const content = aiData.content?.[0]?.text || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const note = Math.min(100, Math.max(0, parsed.note_conformite ?? 0));
        const status: "compliant" | "non_compliant" = note >= 60 ? "compliant" : "non_compliant";

        return {
          status,
          report: {
            foundKeywords,
            note_conformite: note,
            commentaires: parsed.commentaires ?? "",
            details: {
              mentions_legales: parsed.mentions_legales ?? false,
              politique_confidentialite: parsed.politique_confidentialite ?? false,
              bandeau_cookies: parsed.bandeau_cookies ?? false,
              cgv_cgu: parsed.cgv_cgu ?? false,
              donnees_personnelles: parsed.donnees_personnelles ?? false,
              droit_rectification: parsed.droit_rectification ?? false,
            },
            recommandations: parsed.recommandations ?? [],
          },
        };
      }
    }
  } catch (e) {
    console.error("Erreur analyse IA, fallback basique:", e);
  }

  // 5) Fallback si l'IA échoue
  const note = Math.round((foundKeywords.length / keywords.length) * 100);
  const status: "compliant" | "non_compliant" = note >= 60 ? "compliant" : "non_compliant";

  return {
    status,
    report: {
      foundKeywords,
      note_conformite: note,
      commentaires:
        note >= 60
          ? "Le site contient les mentions légales essentielles."
          : "Site incomplet sur les mentions légales.",
      details: {
        mentions_legales: lowerTexte.includes("mentions légales"),
        politique_confidentialite: lowerTexte.includes("politique de confidentialité"),
        bandeau_cookies: lowerTexte.includes("cookies"),
        cgv_cgu: lowerTexte.includes("cgv") || lowerTexte.includes("cgu"),
        donnees_personnelles: lowerTexte.includes("données personnelles"),
        droit_rectification: lowerTexte.includes("droit de rectification"),
      },
      recommandations: [
        "Ajouter des mentions légales complètes",
        "Mettre en place une politique de confidentialité RGPD",
        "Installer un bandeau de consentement aux cookies",
      ],
    },
  };
}