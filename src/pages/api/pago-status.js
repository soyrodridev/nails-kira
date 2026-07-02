import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function GET({ url }) {
  const catalogoId = url.searchParams.get("id");

  const { data, error } = await supabase
    .from("ventas")
    .select("id")
    .eq("catalogo_id", catalogoId)
    .single();

  return new Response(JSON.stringify({ pagado: !!data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}