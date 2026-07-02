import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    const body = await request.json();

    // Mercado Pago envía el tipo de evento
    if (body.type === "payment" || body.action === "payment.updated") {
      const paymentId = body.data.id;

      // Consultamos el detalle del pago a Mercado Pago
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        },
      );
      const paymentData = await response.json();

      // Guardamos en Supabase (ajusta los campos según tu tabla)
      if (paymentData.status === "approved") {
        await supabase.from("pagos_pos").insert({
          payment_id: paymentId,
          catalogo_id: paymentData.external_reference, // Asegúrate de enviar el ID correctamente
          monto: paymentData.transaction_amount,
          estado: "aprobado",
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
