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

export async function checkAndIncrementFixPrompt(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const FREE_LIMIT = 2;
  if (plan !== "free") return { allowed: true, used: 0, limit: Infinity };

  const db = createServiceRoleClient();
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const { data } = await db
    .from("profiles")
    .select("fix_prompt_count, fix_prompt_month")
    .eq("id", userId)
    .single();

  const storedMonth = data?.fix_prompt_month ?? "";
  const count = storedMonth === currentMonth ? (data?.fix_prompt_count ?? 0) : 0;

  if (count >= FREE_LIMIT) {
    return { allowed: false, used: count, limit: FREE_LIMIT };
  }

  await db
    .from("profiles")
    .upsert(
      { id: userId, fix_prompt_count: count + 1, fix_prompt_month: currentMonth, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  return { allowed: true, used: count + 1, limit: FREE_LIMIT };
}
