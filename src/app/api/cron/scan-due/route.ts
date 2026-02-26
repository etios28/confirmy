import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { scanUrl } from "@/lib/scan";
import { nextScanDate } from "@/lib/schedule";
import { notifyNonCompliant } from "@/lib/email";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Sécurisation via header Authorization envoyé automatiquement par Vercel Cron
  const secret = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1) Récupère les sites à échéance (ou sans nextScanAt)
  const due = await prisma.website.findMany({
    where: {
      OR: [
        { nextScanAt: { lte: now } },
        { nextScanAt: null }
      ]
    },
    orderBy: { updatedAt: "asc" },
    take: 100 // sécurité
  });

  const results: any[] = [];

  for (const site of due) {
    try {
      const { status, report } = await scanUrl(site.url);

      // status précédent
      const previous = site.status;

      // calcule prochaine exécution
      const next = nextScanDate(site.plan, now);

      const updated = await prisma.website.update({
        where: { id: site.id },
        data: {
          status,
          report: JSON.stringify(report),
          lastScannedAt: now,
          nextScanAt: next
        }
      });

      // 2) Si passage ✅ -> ❌ => alerte email (pour l'instant vers une boîte fixe)
      if (previous === "compliant" && status === "non_compliant") {
        // TODO: remplace "admin@tonmail.com" par une adresse configurable
        await notifyNonCompliant("etios699@gmail.com", site.url);
      }

      results.push({ id: site.id, url: site.url, ok: true });
    } catch (e) {
      console.error("Cron scan error for", site.url, e);
      results.push({ id: site.id, url: site.url, ok: false, error: String(e) });
    }
  }

  return NextResponse.json({ scanned: results.length, results });
}