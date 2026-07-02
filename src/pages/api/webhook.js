import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";
import { Webhook } from "mercadopago";

export async function POST({ request }) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");
    const secret = process.env.MP_WEBHOOK_SECRET;

    // 1. Validación de seguridad (Firma)
    if (!signature || !requestId || !secret) {
      console.error("Error: Faltan credenciales de seguridad en el webhook");
      return new Response("Faltan credenciales", { status: 401 });
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
      console.error("Error: Firma de webhook inválida");
      return new Response("Firma inválida", { status: 403 });
    }

    // 2. Procesamiento del pago
    if (body.type === "payment" && body.data && body.data.id) {
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
        console.log(
          "Pago aprobado, intentando insertar en pagos_pos...",
          paymentData.external_reference,
        );

        const { error } = await supabase.from("pagos_pos").insert({
          payment_id: String(paymentId),
          catalogo_id: paymentData.external_reference, // Asegúrate de que este valor llegue
          monto: paymentData.transaction_amount,
          estado: "aprobado",
        });

        if (error) {
          console.error("Error al insertar en Supabase:", error);
          throw error;
        }
        console.log("Inserción en BD exitosa");
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error critico en webhook:", error);
    return new Response("Error interno", { status: 500 });
  }
}
