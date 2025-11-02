import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  const website = await prisma.website.findUnique({
    where: { id },
  });

  if (!website) {
    return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ website });
}
