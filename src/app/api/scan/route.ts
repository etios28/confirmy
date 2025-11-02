import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { scanUrl } from "@/lib/scan";
import { nextScanDate } from "@/lib/schedule";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url)
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });

    // Vérifie la validité de l’URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL invalide." }, { status: 400 });
    }

    // Lancement du scan
    const { status, report } = await scanUrl(url);

    // Récupère l’ancien site s’il existe
    const before = await prisma.website.findUnique({ where: { url } });

    const now = new Date();
    const next = null; // Sera défini automatiquement plus tard par le cron
    const chosenPlan = "SCAN_UNIQUE"; // Plan par défaut (scan à 4,99 €)

    // Enregistre ou met à jour le site
    const saved = await prisma.website.upsert({
      where: { url },
      update: {
        status,
        report: JSON.stringify(report),
        lastScannedAt: now,
        nextScanAt: next,
        plan: chosenPlan,
        updatedAt: new Date(),
      },
      create: {
        url,
        status,
        report: JSON.stringify(report),
        lastScannedAt: now,
        nextScanAt: next,
        plan: chosenPlan,
      },
    });

    return NextResponse.json({
      success: true,
      website: saved,
      previousStatus: before?.status || null,
    });
  } catch (error) {
    console.error("Erreur globale du scan:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
