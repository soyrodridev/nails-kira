import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export const POST = async ({ request }) => {
  try {
    const { catalogoId } = await request.json();

    const { data: item } = await supabase
      .from("catalogo_pos")
      .select("precio_venta, productos(titulo)")
      .eq("id", catalogoId)
      .single();

    

    const response = await fetch(
  "https://api.mercadopago.com/checkout/preferences",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: item.productos.titulo,
          quantity: 1,
          unit_price: Number(item.precio_venta),
          currency_id: "ARS",
        },
      ],
      external_reference: `QR_${catalogoId}`,
      notification_url: "https://nails-kira.vercel.app/api/webhook",
    }),
  }
);

console.log("Status:", response.status);

const data = await response.json();
console.log("Respuesta MP:", data);

    // --- DEBUG: ESTO TE DIRÁ LA VERDAD ---
    console.log("Respuesta completa de MP:", JSON.stringify(data));
    // -------------------------------------

    // Si data tiene init_point, lo usamos.
    // Si no, devolvemos el error completo para saber qué pasó.
    if (data.init_point) {
      return new Response(JSON.stringify({ url: data.init_point }), {
        status: 200,
      });
    } else {
      return new Response(
        JSON.stringify({
          error: "No se recibió init_point: " + JSON.stringify(data),
        }),
        { status: 500 },
      );
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
};
