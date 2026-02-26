import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  PRO: process.env.STRIPE_PRICE_PRO!,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS!,
  SCAN_UNIQUE: process.env.STRIPE_PRICE_SCAN_UNIQUE!,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { plan } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const isSubscription = plan !== "SCAN_UNIQUE";

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    metadata: { userId, plan },
  });

  return NextResponse.json({ url: session.url });
}