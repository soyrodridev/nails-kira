import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

console.log(
  "¿Token cargado?:",
  process.env.MERCADOPAGO_ACCESS_TOKEN ? "SÍ" : "NO"
);

// Cliente MP
const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    import.meta.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST({ request }) {
  const IVA = 0.15;

  try {
    const body = await request.json();

    if (!body.items || body.items.length === 0) {
      throw new Error("No hay productos en el carrito");
    }

    const items = body.items.map((item) => ({
      title: item.titulo,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio) * (1 + IVA),
      currency_id: "ARS",
    }));

    // 🧠 CREAR ORDEN EN SUPABASE (NUEVO)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          items: body.items,
          status: "pending",
          created_at: new Date(),
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.log(orderError);
      throw new Error("Error guardando orden");
    }

    const preference = new Preference(client);

    const DOMAIN = import.meta.env.SITE;

    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success: `${DOMAIN}/success?order_id=${order.id}`,
          failure: `${DOMAIN}/failure?order_id=${order.id}`,
          pending: `${DOMAIN}/pending?order_id=${order.id}`,
        },
        auto_return: "approved",
        binary_mode: true,
      },
    });

    // 🔥 guardar init_point en la orden (opcional pro)
    await supabase
      .from("orders")
      .update({
        mp_init_point: response.init_point,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ init_point: response.init_point }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}