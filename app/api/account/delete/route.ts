import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Delete user via admin API (cascades to scans + profiles via FK)
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  // Sign out the session
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
