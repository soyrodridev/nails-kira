import { MercadoPagoConfig, Preference } from "mercadopago";

console.log("¿Token cargado?:", import.meta.env.MERCADOPAGO_ACCESS_TOKEN ? "SÍ" : "NO");
// ✅ Cliente MP - El nombre debe ser EXACTO al del archivo .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || import.meta.env.MERCADOPAGO_ACCESS_TOKEN, 
});

export async function POST({ request }) {
  const IVA = 0.15;
  try {
    const body = await request.json();

    // Pequeña validación de seguridad
    if (!body.items || body.items.length === 0) {
       throw new Error("No hay productos en el carrito");
    }

    const items = body.items.map((item) => ({
      title: item.titulo,
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio) * (1 + IVA),
      currency_id: "ARS",
    }));

    const preference = new Preference(client);

const DOMAIN = import.meta.env.SITE;

const response = await preference.create({
  body: {
    items: items,
    back_urls: {
      success: `${DOMAIN}/success`,
      failure: `${DOMAIN}/failure`,
      pending: `${DOMAIN}/pending`,
    },
    auto_return: "approved", // Ahora con HTTPS debería validar bien
    binary_mode: true,
  },
});

    return new Response(JSON.stringify({ init_point: response.init_point }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}