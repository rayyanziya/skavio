import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { upsertProfile } from "@/lib/db/profiles";
import { getVariantToPlan } from "@/lib/lemonsqueezy";

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifySignature(rawBody, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName: string = payload.meta?.event_name ?? "";
  const userId: string | undefined = payload.meta?.custom_data?.user_id;
  const attrs = payload.data?.attributes ?? {};
  const subscriptionId = String(payload.data?.id ?? "");
  const variantId = String(attrs.variant_id ?? "");
  const plan = getVariantToPlan()[variantId] ?? "free";
  const status: string = attrs.status ?? "";
  const customerId = String(attrs.customer_id ?? "");
  const periodEnd: string | null = attrs.ends_at ?? attrs.renews_at ?? null;
  const portalUrl: string | null = attrs.urls?.customer_portal ?? null;

  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_resumed":
    case "subscription_unpaused":
      await upsertProfile(userId, {
        plan: status === "active" || status === "on_trial" ? plan : "free",
        ls_subscription_id: subscriptionId,
        ls_customer_id: customerId,
        ls_status: status,
        ls_portal_url: portalUrl,
        period_end: periodEnd,
      });
      break;

    case "subscription_cancelled":
      await upsertProfile(userId, {
        ls_status: "cancelled",
        ls_portal_url: portalUrl,
        period_end: periodEnd,
      });
      break;

    case "subscription_expired":
    case "subscription_paused":
      await upsertProfile(userId, {
        plan: "free",
        ls_status: status,
        period_end: periodEnd,
      });
      break;
  }

  return NextResponse.json({ ok: true });
}
