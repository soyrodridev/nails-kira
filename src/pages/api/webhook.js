import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export const POST = async ({ request }) => {
  try {
    const body = await request.json();

    console.log("Webhook recibido:", body);

    if (body.type !== "payment" || !body.data?.id) {
      return new Response("OK", { status: 200 });
    }

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${body.data.id}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      },
    );

    if (!mpResponse.ok) {
      console.error(await mpResponse.text());
      return new Response("Error consultando Mercado Pago", { status: 500 });
    }

    const payment = await mpResponse.json();

    console.log(payment);

    if (payment.status !== "approved") {
      return new Response("OK", { status: 200 });
    }

    const isQR =
      payment.external_reference &&
      payment.external_reference.startsWith("QR_");

    const catalogId = isQR
      ? payment.external_reference.replace("QR_", "")
      : payment.external_reference;

    const { data: existe } = await supabase
      .from("pagos_pos")
      .select("id")
      .eq("payment_id", String(payment.id))
      .maybeSingle();

    if (!existe) {
      const { error } = await supabase.from("pagos_pos").insert({
        payment_id: String(payment.id),
        catalogo_id: catalogId,
        monto: payment.transaction_amount,
        estado: "aprobado",
        tipo: isQR ? "QR" : "LINK",
      });

      if (error) {
        console.error(error);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);

    return new Response("Error", {
      status: 500,
    });
  }
};
