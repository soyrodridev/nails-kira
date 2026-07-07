import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function GET({ url }) {
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ pagado: false }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pagos_pos")
    .select("payment_id")
    .eq("catalogo_id", id)
    .eq("estado", "aprobado")
    .limit(1);

  if (error) {
    console.error(error);
    return Response.json({ pagado: false });
  }

  return Response.json({
    pagado: data.length > 0,
  });
}