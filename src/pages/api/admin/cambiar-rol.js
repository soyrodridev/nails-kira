

import { supabaseAdmin as supabase } from "../../../lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabase
    .from("perfiles")
    .select("id,email,username,role")
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
