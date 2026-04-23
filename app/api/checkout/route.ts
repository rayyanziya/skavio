import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutUrl } from "@/lib/lemonsqueezy";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const plan = body.plan;
  if (!plan || !["starter", "pro", "agency"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const url = await createCheckoutUrl(
      plan as "starter" | "pro" | "agency",
      user.email!,
      user.id
    );
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
