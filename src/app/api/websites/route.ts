import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const websites = await prisma.website.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ websites });
  } catch (error) {
    console.error("Erreur API websites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
