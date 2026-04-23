import { createServiceRoleClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  plan: string;
  ls_subscription_id: string | null;
  ls_customer_id: string | null;
  ls_status: string | null;
  ls_portal_url: string | null;
  period_end: string | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const db = createServiceRoleClient();
  const { data } = await db.from("profiles").select("*").eq("id", userId).single();
  return data ?? null;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id">>
): Promise<void> {
  const db = createServiceRoleClient();
  await db
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: "id" });
}
