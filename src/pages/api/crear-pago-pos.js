import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
const client = new MercadoPagoConfig({ accessToken: accessToken || "" });

export async function POST({ request }) {
  try {
    const { catalogoId } = await request.json();

    // 1. Obtener datos del producto desde nuestra tabla de catálogo
    const { data: item, error } = await supabase
      .from("catalogo_pos")
      .select(`precio_venta, productos (titulo)`)
      .eq("id", catalogoId)
      .single();

    if (error || !item) throw new Error("Producto no encontrado");

    // 2. Crear preferencia para Mercado Pago
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: [{
          title: item.productos.titulo,
          quantity: 1,
          unit_price: Number(item.precio_venta),
          currency_id: "ARS",
        }],
        // En el POS no necesitamos back_urls de navegación, 
        // solo queremos el link para mostrar el QR
      },
    });

    return new Response(JSON.stringify({ init_point: response.init_point }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}