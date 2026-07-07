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
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const { data, error } = await supabase
    .from("pagos_pos")
    .select("id")
    .eq("catalogo_id", id)
    .eq("estado", "aprobado")
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  return new Response(
    JSON.stringify({
      pagado: !!data,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
