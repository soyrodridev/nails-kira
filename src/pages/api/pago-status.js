import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function GET({ url }) {
  const catalogoId = url.searchParams.get("id");

  const { data } = await supabase
    .from("pagos_pos")
    .select("estado")
    .eq("catalogo_id", catalogoId)
    .eq("estado", "aprobado") // Solo nos importa si ya está aprobado
    .maybeSingle();

  return new Response(JSON.stringify({ pagado: !!data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}