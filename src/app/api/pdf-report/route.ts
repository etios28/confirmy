import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

const C = {
  purple:      rgb(0.49, 0.23, 0.93),
  purpleDark:  rgb(0.31, 0.14, 0.55),
  purpleLight: rgb(0.92, 0.88, 1.00),
  white:       rgb(1, 1, 1),
  dark:        rgb(0.07, 0.06, 0.14),
  gray:        rgb(0.39, 0.38, 0.43),
  grayLight:   rgb(0.96, 0.95, 0.97),
  green:       rgb(0.13, 0.77, 0.37),
  greenLight:  rgb(0.86, 0.99, 0.91),
  red:         rgb(0.94, 0.27, 0.27),
  redLight:    rgb(1.00, 0.89, 0.89),
  amber:       rgb(0.70, 0.51, 0.08),
};

function scoreColor(note: number) {
  if (note >= 60) return C.green;
  if (note >= 30) return C.amber;
  return C.red;
}

function drawRect(page: any, x: number, y: number, w: number, h: number, color: any) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Dessine la balance en traits (remplace l'emoji ⚖ non encodable)
function drawBalanceIcon(page: any, x: number, y: number, color: any) {
  // Tige centrale
  page.drawLine({ start: { x: x + 7, y: y }, end: { x: x + 7, y: y + 16 }, thickness: 1.5, color });
  // Barre horizontale
  page.drawLine({ start: { x: x + 1, y: y + 12 }, end: { x: x + 13, y: y + 12 }, thickness: 1.2, color });
  // Bras gauche
  page.drawLine({ start: { x: x + 1, y: y + 12 }, end: { x: x + 1, y: y + 7 }, thickness: 1, color });
  // Bras droit
  page.drawLine({ start: { x: x + 13, y: y + 12 }, end: { x: x + 13, y: y + 7 }, thickness: 1, color });
  // Plateau gauche (arc simulé en 3 segments)
  page.drawLine({ start: { x: x - 2, y: y + 7 }, end: { x: x + 1, y: y + 5 }, thickness: 1, color });
  page.drawLine({ start: { x: x + 1, y: y + 5 }, end: { x: x + 4, y: y + 7 }, thickness: 1, color });
  // Plateau droit
  page.drawLine({ start: { x: x + 10, y: y + 7 }, end: { x: x + 13, y: y + 5 }, thickness: 1, color });
  page.drawLine({ start: { x: x + 13, y: y + 5 }, end: { x: x + 16, y: y + 7 }, thickness: 1, color });
  // Socle
  page.drawLine({ start: { x: x + 4, y: y }, end: { x: x + 10, y: y }, thickness: 1.5, color });
}

// Dessine OK ou X en traits (remplace ✓ / ✗)
function drawCheckMark(page: any, cx: number, cy: number, ok: boolean, color: any) {
  if (ok) {
    // Coche : deux segments
    page.drawLine({ start: { x: cx - 3, y: cy }, end: { x: cx - 1, y: cy - 2 }, thickness: 1.5, color });
    page.drawLine({ start: { x: cx - 1, y: cy - 2 }, end: { x: cx + 3, y: cy + 3 }, thickness: 1.5, color });
  } else {
    // Croix : deux diagonales
    page.drawLine({ start: { x: cx - 3, y: cy - 3 }, end: { x: cx + 3, y: cy + 3 }, thickness: 1.5, color });
    page.drawLine({ start: { x: cx + 3, y: cy - 3 }, end: { x: cx - 3, y: cy + 3 }, thickness: 1.5, color });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const site = await prisma.website.findFirst({ where: { id, userId } });
    if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });

    const report         = site.report ? JSON.parse(site.report) : {};
    const note: number   = report.note_conformite ?? 0;
    const details        = report.details ?? {};
    const recommandations: string[] = report.recommandations ?? [];
    const pages_scannees: string[]  = report.pages_scannees ?? [];
    const confiance: number         = report.confiance_analyse ?? 50;
    const isCompliant                = site.status === "compliant";

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(`Rapport Conformy - ${site.url}`);
    pdfDoc.setAuthor("Conformy");
    pdfDoc.setSubject("Rapport de conformite juridique");
    pdfDoc.setCreator("Conformy (conformy.vercel.app)");

    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const margin   = 40;
    const contentW = width - margin * 2;

    const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = height;

    // ── HEADER ──────────────────────────────────────────────────────────────
    drawRect(page, 0, height - 56, width, 56, C.purple);
    drawRect(page, margin, height - 46, 26, 26, C.purpleDark);
    drawBalanceIcon(page, margin + 5, height - 42, C.white);

    page.drawText("Conformy", { x: margin + 34, y: height - 22, size: 16, font: fontBold, color: C.white });
    page.drawText("RAPPORT DE CONFORMITE JURIDIQUE", { x: margin + 34, y: height - 35, size: 7, font: fontNormal, color: rgb(0.82, 0.78, 1) });

    const dateStr = new Date(site.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    // Retirer les caractères accentués du mois pour éviter tout problème d'encodage
    const dateSafe = dateStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const dateW = fontNormal.widthOfTextAtSize(dateSafe, 8);
    page.drawText(dateSafe, { x: width - margin - dateW - 50, y: height - 22, size: 8, font: fontNormal, color: rgb(0.82, 0.78, 1) });

    // Score badge
    drawRect(page, width - margin - 44, height - 50, 44, 44, C.purpleDark);
    const scoreStr = String(note);
    const scoreW   = fontBold.widthOfTextAtSize(scoreStr, 18);
    page.drawText(scoreStr, { x: width - margin - 22 - scoreW / 2, y: height - 30, size: 18, font: fontBold, color: C.white });
    const subW = fontNormal.widthOfTextAtSize("/100", 7);
    page.drawText("/100", { x: width - margin - 22 - subW / 2, y: height - 42, size: 7, font: fontNormal, color: rgb(0.82, 0.78, 1) });

    y = height - 68;

    // ── URL + STATUT ─────────────────────────────────────────────────────────
    drawRect(page, margin, y - 20, contentW, 24, C.grayLight);
    page.drawText("URL ANALYSEE", { x: margin + 6, y: y - 8, size: 6.5, font: fontBold, color: C.gray });
    const urlDisplay = site.url.length > 60 ? site.url.slice(0, 57) + "..." : site.url;
    page.drawText(urlDisplay, { x: margin + 6, y: y - 17, size: 9, font: fontBold, color: C.purple });

    const badgeTxt = isCompliant ? "Conforme" : "Non conforme";
    const badgeBg  = isCompliant ? C.greenLight : C.redLight;
    const badgeFg  = isCompliant ? C.green : C.red;
    const badgeW   = fontBold.widthOfTextAtSize(badgeTxt, 8) + 20;
    drawRect(page, width - margin - badgeW, y - 17, badgeW, 12, badgeBg);
    // Petite coche/croix dans le badge
    drawCheckMark(page, width - margin - badgeW + 8, y - 11, isCompliant, badgeFg);
    page.drawText(badgeTxt, { x: width - margin - badgeW + 14, y: y - 12, size: 8, font: fontBold, color: badgeFg });

    y -= 30;

    // ── BARRE SCORE ──────────────────────────────────────────────────────────
    page.drawText(`Note de conformite : ${note}/100`, { x: margin, y: y - 2, size: 8, font: fontBold, color: C.dark });
    y -= 8;
    drawRect(page, margin, y - 8, contentW, 8, C.grayLight);
    if (note > 0) drawRect(page, margin, y - 8, (note / 100) * contentW, 8, scoreColor(note));
    y -= 18;

    // ── ANALYSE IA ───────────────────────────────────────────────────────────
    if (report.commentaires) {
      drawRect(page, margin, y - 10, 46, 10, C.purpleLight);
      page.drawText("ANALYSE IA", { x: margin + 4, y: y - 8, size: 6.5, font: fontBold, color: C.purple });
      y -= 16;

      const lines  = wrapText(report.commentaires, fontNormal, 9, contentW - 20);
      const blockH = lines.length * 13 + 10;
      drawRect(page, margin, y - blockH, contentW, blockH, C.grayLight);
      drawRect(page, margin, y - blockH, 3, blockH, C.purple);
      lines.forEach((l, i) => {
        page.drawText(l, { x: margin + 10, y: y - 10 - i * 13, size: 9, font: fontNormal, color: C.dark });
      });
      y -= blockH + 12;
    }

    // ── POINTS VERIFIES ──────────────────────────────────────────────────────
    drawRect(page, margin, y - 10, 58, 10, C.purpleLight);
    page.drawText("POINTS VERIFIES", { x: margin + 4, y: y - 8, size: 6.5, font: fontBold, color: C.purple });
    y -= 16;

    const checks: [string, boolean, string][] = [
      ["Mentions legales LCEN",            details.mentions_legales,          "Editeur, hebergeur, SIRET/RCS"],
      ["Politique de confidentialite RGPD", details.politique_confidentialite, "Base legale, droits, traitements"],
      ["Bandeau cookies (ePrivacy)",        details.bandeau_cookies,           "Refus possible avant depot"],
      ["CGV / CGU",                         details.cgv_cgu,                   "E-commerce ou SaaS"],
      ["Donnees personnelles",              details.donnees_personnelles,       "Traitement & base legale"],
      ["Droit de rectification",            details.droit_rectification,        "Article 16 RGPD"],
      ["Droit a l'oubli / suppression",     details.droit_oubli,               "Article 17 RGPD"],
      ["Portabilite des donnees",           details.portabilite_donnees,        "Article 20 RGPD"],
      ["Duree de conservation",             details.duree_conservation,         "Precisee dans la politique"],
      ["Sous-traitants & transferts UE",    details.sous_traitants,             "Tiers, pays hors UE"],
      ["DPO / Contact protection donnees",  details.dpo_contact,                "Coordonnees du delegue"],
      ["HTTPS / Securite transport",        details.https_securise,             "Chiffrement TLS actif"],
      ["Securite (mots de passe)",          details.securite_mdp,               "Politique de securite"],
    ];

    const colW = (contentW - 8) / 2;
    checks.forEach(([label, ok, sub], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx  = margin + col * (colW + 8);
      const cy  = y - row * 22;

      drawRect(page, cx, cy - 18, colW, 18, C.grayLight);
      // Pastille colorée
      drawRect(page, cx + 3, cy - 15, 12, 12, ok ? C.greenLight : C.redLight);
      // Coche ou croix dans la pastille
      drawCheckMark(page, cx + 9, cy - 9, ok, ok ? C.green : C.red);
      page.drawText(label, { x: cx + 20, y: cy - 8,  size: 7.5, font: fontBold,   color: C.dark });
      page.drawText(sub,   { x: cx + 20, y: cy - 15, size: 6.5, font: fontNormal, color: C.gray });
    });

    y -= Math.ceil(checks.length / 2) * 22 + 14;

    // ── RECOMMANDATIONS ──────────────────────────────────────────────────────
    if (recommandations.length > 0) {
      let pg = page;
      if (y < 120) {
        pg = pdfDoc.addPage([595, 842]);
        y  = height - 40;
      }

      drawRect(pg, margin, y - 10, 80, 10, C.purpleLight);
      pg.drawText("RECOMMANDATIONS PRIORITAIRES", { x: margin + 4, y: y - 8, size: 6.5, font: fontBold, color: C.purple });
      y -= 16;

      recommandations.forEach((reco: string, i: number) => {
        const lines  = wrapText(reco, fontNormal, 9, contentW - 26);
        const blockH = lines.length * 12 + 10;
        drawRect(pg, margin, y - blockH, contentW, blockH, C.grayLight);
        drawRect(pg, margin + 4, y - blockH + 4, 14, 14, C.purple);
        const numW = fontBold.widthOfTextAtSize(String(i + 1), 8);
        pg.drawText(String(i + 1), { x: margin + 11 - numW / 2, y: y - blockH + 10, size: 8, font: fontBold, color: C.white });
        lines.forEach((l, li) => {
          pg.drawText(l, { x: margin + 24, y: y - 9 - li * 12, size: 9, font: fontNormal, color: C.dark });
        });
        y -= blockH + 5;
      });
    }

    // ── PAGES SCANNÉES + CONFIANCE ───────────────────────────────────────────
    y -= 8;
    if (pages_scannees.length > 0) {
      const ps = pages_scannees.slice(0, 4).join("  /  ") + (pages_scannees.length > 4 ? "  / ..." : "");
      const psSafe = `Pages analysees : ${ps}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      page.drawText(psSafe, { x: margin, y: Math.max(y, 60), size: 6.5, font: fontNormal, color: C.gray });
    }
    page.drawText(`Indice de confiance : ${confiance}/100`, { x: margin, y: Math.max(y - 10, 50), size: 6.5, font: fontNormal, color: C.gray });

    // ── FOOTER ───────────────────────────────────────────────────────────────
    for (const p of pdfDoc.getPages()) {
      drawRect(p, 0, 0, width, 20, C.purple);
      p.drawText("Conformy", { x: margin, y: 7, size: 7.5, font: fontBold, color: C.white });
      const disc  = "Rapport genere automatiquement - ne constitue pas un avis juridique";
      const discW = fontNormal.widthOfTextAtSize(disc, 7);
      p.drawText(disc, { x: width / 2 - discW / 2, y: 7, size: 7, font: fontNormal, color: rgb(0.82, 0.78, 1) });
      const siteStr = "conformy.vercel.app";
      const siteW   = fontNormal.widthOfTextAtSize(siteStr, 7);
      p.drawText(siteStr, { x: width - margin - siteW, y: 7, size: 7, font: fontNormal, color: rgb(0.82, 0.78, 1) });
    }

    // ── Sérialiser ───────────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const safeName = site.url.replace(/https?:\/\//, "").replace(/\W+/g, "_").slice(0, 40);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="conformy_${safeName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Erreur generation PDF" }, { status: 500 });
  }
}