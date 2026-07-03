import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";
import pkg from 'mercadopago';
const { Webhook } = pkg;

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");
    const secret = process.env.MP_WEBHOOK_SECRET;

    // Validación de seguridad
    const isValid = Webhook.validate(body, { "x-signature": signature, "x-request-id": requestId }, secret);
    if (!isValid) return new Response("Firma inválida", { status: 403 });

    if (body.type === "payment" && body.data?.id) {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const paymentData = await response.json();

      if (paymentData.status === "approved") {
        // Determinamos el origen
        const isQR = paymentData.external_reference?.startsWith("QR_");
        const catalogId = isQR ? paymentData.external_reference.replace("QR_", "") : paymentData.external_reference;

        await supabase.from("pagos_pos").insert({
          payment_id: String(paymentData.id),
          catalogo_id: catalogId,
          monto: paymentData.transaction_amount,
          estado: "aprobado",
          tipo: isQR ? "QR" : "LINK" // Opcional: agrega esta columna a tu tabla
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
};