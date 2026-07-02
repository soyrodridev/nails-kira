import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  const ACCESS_TOKEN =
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    import.meta.env.MERCADOPAGO_ACCESS_TOKEN;

  try {
    const { catalogoId } = await request.json();

    const { data: item, error } = await supabase
      .from("catalogo_pos")
      .select(`
        precio_venta,
        productos(
          titulo
        )
      `)
      .eq("id", catalogoId)
      .single();

    if (error || !item) {
      throw new Error("Producto no encontrado");
    }

    // Eliminamos pagos viejos por si vuelven a generar QR
    await supabase
      .from("pagos_mp")
      .delete()
      .eq("catalogo_id", catalogoId);

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: item.productos.titulo,
              quantity: 1,
              currency_id: "ARS",
              unit_price: Number(item.precio_venta),
            },
          ],

          external_reference: String(catalogoId),

          metadata: {
            catalogo_id: String(catalogoId),
          },

          notification_url:
            "https://nails-kira.vercel.app/api/webhook",

          auto_return: "approved",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error(data.message || "Error creando preferencia");
    }

    return new Response(
      JSON.stringify({
        init_point: data.init_point,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: 500,
      }
    );
  }
}