import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function GET({ url }) {

  const id = url.searchParams.get("id");

  if (!id) {

    return new Response(
      JSON.stringify({
        pagado: false,
      }),
      {
        status: 400,
      }
    );

  }

  const { data } = await supabase
    .from("pagos_mp")
    .select("*")
    .eq("catalogo_id", id)
    .eq("estado", "approved")
    .maybeSingle();

  return new Response(
    JSON.stringify({
      pagado: !!data,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}