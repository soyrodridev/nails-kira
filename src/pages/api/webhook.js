import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  const ACCESS_TOKEN =
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    import.meta.env.MERCADOPAGO_ACCESS_TOKEN;

  try {
    const body = await request.json();

    if (body.type !== "payment") {
      return new Response("OK", {
        status: 200,
      });
    }

    const paymentId = body.data.id;

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await response.json();

    if (payment.status !== "approved") {
      return new Response("OK", {
        status: 200,
      });
    }

    const catalogoId =
      payment.metadata?.catalogo_id ||
      payment.external_reference;

    if (!catalogoId) {
      return new Response("OK", {
        status: 200,
      });
    }

    // Evita duplicados
    const { data: existente } = await supabase
      .from("pagos_mp")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle();

    if (!existente) {
      await supabase
        .from("pagos_mp")
        .insert({
          catalogo_id: catalogoId,
          payment_id: payment.id,
          estado: payment.status,
          monto: payment.transaction_amount,
        });
    }

    return new Response("OK", {
      status: 200,
    });

  } catch (e) {

    console.error(e);

    return new Response("ERROR", {
      status: 500,
    });

  }
}