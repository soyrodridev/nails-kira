import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";
import { Webhook } from "mercadopago";

export async function POST({ request }) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");
    const secret = process.env.MP_WEBHOOK_SECRET;

    // Validación de seguridad (Firma)
    if (!signature || !requestId || !secret) {
      return new Response("Faltan credenciales de seguridad", { status: 401 });
    }

    const isValid = Webhook.validate(
      body,
      {
        "x-signature": signature,
        "x-request-id": requestId,
      },
      secret,
    );

    if (!isValid) {
      return new Response("Firma inválida", { status: 403 });
    }

    // Procesamiento de evento
    if (body.type === "payment" || body.action === "payment.updated") {
      const paymentId = body.data.id;

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        },
      );

      const paymentData = await response.json();

      if (paymentData.status === "approved") {
        const { error } = await supabase.from("pagos_pos").insert({
          payment_id: String(paymentId),
          catalogo_id: paymentData.external_reference,
          monto: paymentData.transaction_amount,
          estado: "aprobado",
        });

        if (error) throw error;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error en Webhook:", error);
    return new Response("Error en servidor", { status: 500 });
  }
}
