import { PromotionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/request-session";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  listingId: z.string().min(3),
  plan: z.enum(["TOP_30", "PROMOTED_15", "PROMOTED_7"]),
});

const plans: Record<PromotionPlan, { label: string; amountRon: number; days: number }> = {
  TOP_30: { label: "Job Top 30 zile", amountRon: 299, days: 30 },
  PROMOTED_15: { label: "Job Promovat 15 zile", amountRon: 189, days: 15 },
  PROMOTED_7: { label: "Job Promovat 7 zile", amountRon: 129, days: 7 },
};

export async function POST(request: Request) {
  const sessionUser = await getSessionFromRequest(request);
  if (!requireRole(sessionUser, ["COMPANY", "ADMIN"])) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }
  if (!sessionUser) {
    return NextResponse.json({ message: "Acces interzis." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Cerere Stripe invalida." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) {
    return NextResponse.json({ message: "Listarea nu exista." }, { status: 404 });
  }
  if (sessionUser.role !== "ADMIN" && listing.ownerUserId !== sessionUser.userId) {
    return NextResponse.json(
      { message: "Nu poti promova anuntul altei companii." },
      { status: 403 },
    );
  }

  const selectedPlan = plans[parsed.data.plan];
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { message: "Stripe nu este configurat. Seteaza STRIPE_SECRET_KEY." },
      { status: 501 },
    );
  }

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "ron",
          unit_amount: selectedPlan.amountRon * 100,
          product_data: {
            name: selectedPlan.label,
            description: `Promovare pentru anuntul: ${listing.title}`,
          },
        },
      },
    ],
    success_url: `${origin}/company?promotion=success`,
    cancel_url: `${origin}/company?promotion=cancel`,
    metadata: {
      listingId: listing.id,
      plan: parsed.data.plan,
    },
  });

  await prisma.promotion.create({
    data: {
      listingId: listing.id,
      plan: parsed.data.plan,
      priceRon: selectedPlan.amountRon,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + selectedPlan.days * 24 * 60 * 60 * 1000),
      stripePaymentId: session.id,
    },
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
