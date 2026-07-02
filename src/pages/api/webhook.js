import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Webhook recibido (DEBUG):", JSON.stringify(body));

    // Si el pago está aprobado (simplemente validamos el tipo)
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;

      // Usamos el id del pago para registrarlo (sin validaciones complejas por ahora)
      const { error } = await supabase.from("pagos_pos").insert({
        payment_id: String(paymentId),
        catalogo_id: body.data.external_reference || "sin-ref",
        estado: "aprobado",
        monto: 0, // Valor temporal para probar
      });

      if (error) {
        console.error("Error en Supabase:", error);
        return new Response("Error en DB", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error crítico:", error);
    return new Response("Error en servidor", { status: 500 });
  }
}
