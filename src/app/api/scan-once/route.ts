import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/**
 * Cette route analyse un site sans rien enregistrer dans la base Prisma.
 * Elle renvoie simplement le résultat du scan (statut, note, mots-clés, etc.).
 */

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }

    // Validation rapide de l'URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "URL invalide." }, { status: 400 });
    }

    // Récupération du contenu HTML du site
    const response = await fetch(parsedUrl.href, {
      headers: { "User-Agent": "ConformyBot/1.0" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible d’accéder au site distant." },
        { status: 500 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 🔍 Analyse simple de conformité
    const keywords = ["mentions légales", "confidentialité", "cookie", "rgpd"];
    const foundKeywords = keywords.filter((k) =>
      html.toLowerCase().includes(k.toLowerCase())
    );

    const note_conformite = Math.round((foundKeywords.length / keywords.length) * 100);
    const status = note_conformite >= 60 ? "compliant" : "non_compliant";

    const report = {
      foundKeywords,
      note_conformite,
      commentaires:
        note_conformite >= 60
          ? "Le site semble contenir les mentions légales essentielles."
          : "Des éléments obligatoires manquent (mentions légales, confidentialité, etc.).",
    };

    // ✅ On renvoie le rapport sans rien sauvegarder
    return NextResponse.json({
      success: true,
      url,
      status,
      report,
    });
  } catch (err) {
    console.error("Erreur /api/scan-once :", err);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
