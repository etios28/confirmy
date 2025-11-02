import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Utilisateur manquant" }, { status: 400 });
  }

  const websites = await prisma.website.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 800]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  let y = 760;
  page.drawText("Rapport Conformy", { x: 50, y, size: 20, font, color: rgb(0, 0.7, 1) });
  y -= 40;

  for (const site of websites) {
    const report = site.report ? JSON.parse(site.report) : {};
    const status =
      site.status === "compliant" ? "✅ Conforme" : "❌ Non conforme";

    page.drawText(`${site.url}`, { x: 50, y, size: 12, font, color: rgb(1, 1, 1) });
    y -= 15;
    page.drawText(`Statut: ${status}`, { x: 60, y, size: 10, font });
    y -= 12;
    page.drawText(`Note: ${report.note_conformite ?? "-"}`, { x: 60, y, size: 10, font });
    y -= 12;
    page.drawText(`Commentaires: ${report.commentaires ?? "-"}`, { x: 60, y, size: 10, font });
    y -= 30;
    if (y < 50) {
      y = 760;
      pdf.addPage([600, 800]);
    }
  }

const pdfBytes: Uint8Array = await pdf.save();

return new Response(pdfBytes, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=rapport_conformy.pdf",
  },
});


}
