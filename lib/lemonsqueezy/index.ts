const LS_API_URL = "https://api.lemonsqueezy.com/v1";

export const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 30,
  pro: 100,
  agency: Infinity,
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

export function getVariantToPlan(): Record<string, string> {
  return {
    [process.env.LEMONSQUEEZY_VARIANT_STARTER!]: "starter",
    [process.env.LEMONSQUEEZY_VARIANT_PRO!]: "pro",
    [process.env.LEMONSQUEEZY_VARIANT_AGENCY!]: "agency",
  };
}

export async function createCheckoutUrl(
  plan: "starter" | "pro" | "agency",
  userEmail: string,
  userId: string
): Promise<string> {
  const variantIds: Record<string, string> = {
    starter: process.env.LEMONSQUEEZY_VARIANT_STARTER!,
    pro: process.env.LEMONSQUEEZY_VARIANT_PRO!,
    agency: process.env.LEMONSQUEEZY_VARIANT_AGENCY!,
  };

  const res = await fetch(`${LS_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY!}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            success_url: "https://skav.io/dashboard?upgraded=1",
          },
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID! },
          },
          variant: {
            data: { type: "variants", id: variantIds[plan] },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LemonSqueezy error: ${err}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}
