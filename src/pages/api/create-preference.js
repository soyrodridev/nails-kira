import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

// Inicializamos el cliente de forma segura
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
const client = new MercadoPagoConfig({ accessToken: accessToken || "" });

export async function POST({ request }) {
  const IVA = 0.15;

  try {
    // 1. Validar variables críticas
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
    
    const body = await request.json();
    if (!body.items || body.items.length === 0) {
      throw new Error("No hay productos en el carrito");
    }

    // 2. Preparar items
    const items = body.items.map((item) => ({
      title: item.titulo,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio) * (1 + IVA),
      currency_id: "ARS",
    }));

    // 3. Guardar orden en Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          items: body.items,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Supabase Error:", orderError);
      throw new Error("Error guardando orden en base de datos");
    }

    // 4. Crear preferencia en MercadoPago
    const preference = new Preference(client);
    const DOMAIN = process.env.SITE || import.meta.env.SITE || "https://nails-kira.vercel.app";

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

    // 5. Actualizar orden con el link de pago
    await supabase
      .from("orders")
      .update({ mp_init_point: response.init_point })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ init_point: response.init_point }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("DETALLE DEL ERROR EN API:", error);

    // Retornamos un error JSON válido siempre para evitar el error del frontend
    return new Response(
      JSON.stringify({ 
        error: error.message || "Error interno del servidor" 
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}