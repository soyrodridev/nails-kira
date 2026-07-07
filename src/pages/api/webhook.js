import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";
import pkg from "mercadopago";

const { Webhook } = pkg;

export const POST = async ({ request }) => {
  try {
    const body = await request.json();

    console.log("Webhook recibido:", body);

    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");
    const secret = import.meta.env.MP_WEBHOOK_SECRET;

    // Validar la firma SOLO si Mercado Pago la envía
    if (signature && requestId && secret) {
      try {
        const isValid = Webhook.validate(
          body,
          {
            "x-signature": signature,
            "x-request-id": requestId,
          },
          secret
        );

        if (!isValid) {
          console.error("Firma inválida");
          return new Response("Firma inválida", { status: 403 });
        }
      } catch (err) {
        console.error("Error validando firma:", err);
      }
    }

    // Solo procesamos pagos
    if (body.type !== "payment" || !body.data?.id) {
      return new Response("OK", { status: 200 });
    }

    // Consultar el pago en Mercado Pago
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${body.data.id}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!mpResponse.ok) {
      const error = await mpResponse.text();
      console.error("Error consultando pago:", error);
      return new Response("Error consultando Mercado Pago", { status: 500 });
    }

    const paymentData = await mpResponse.json();

    console.log("Pago obtenido:", paymentData);

    if (paymentData.status === "approved") {
      const isQR =
        paymentData.external_reference &&
        paymentData.external_reference.startsWith("QR_");

      const catalogId = isQR
        ? paymentData.external_reference.replace("QR_", "")
        : paymentData.external_reference;

      // Evitar duplicados
      const { data: existe } = await supabase
        .from("pagos_pos")
        .select("id")
        .eq("payment_id", String(paymentData.id))
        .maybeSingle();

      if (!existe) {
        const { error } = await supabase.from("pagos_pos").insert({
          payment_id: String(paymentData.id),
          catalogo_id: catalogId,
          monto: paymentData.transaction_amount,
          estado: "aprobado",
          tipo: isQR ? "QR" : "LINK",
        });

        if (error) {
          console.error("Error guardando en Supabase:", error);
          return new Response("Error BD", { status: 500 });
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("ERROR WEBHOOK:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};