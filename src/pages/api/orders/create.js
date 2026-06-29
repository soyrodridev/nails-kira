export const prerender = false;
import { supabaseAdmin } from "../../../lib/supabaseAdmin"; // Usa el cliente con SERVICE_ROLE

export async function POST({ request, cookies }) {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  // 1. Autenticación simplificada
  if (!accessToken || !refreshToken)
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
    });

  const { data: sessionData } = await supabaseAdmin.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (!sessionData.session)
    return new Response(JSON.stringify({ error: "Sesión inválida" }), {
      status: 401,
    });

  const body = await request.json(); // Esperamos { order_code, payment_method, items: [{id, talle, cantidad}] }

  // 2. Seguridad: Calcular total en el servidor consultando los precios reales
  let totalCalculado = 0;
  const itemsConPrecios = [];

  for (const item of body.items) {
    const { data: producto, error: pError } = await supabaseAdmin
      .from("productos")
      .select("precio, titulo")
      .eq("id", item.id)
      .single();

    if (pError || !producto)
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), {
        status: 400,
      });

    itemsConPrecios.push({
      id: item.id,
      titulo: producto.titulo,
      precio: producto.precio,
      talle: item.talle, // <--- Esto vendrá del frontend
      cantidad: item.cantidad,
      subtotal: producto.precio * item.cantidad,
    });

    totalCalculado += producto.precio * item.cantidad;
  }

  const { error } = await supabaseAdmin.from("orders").insert([
    {
      order_code: body.order_code,
      total: totalCalculado,
      payment_method: body.payment_method,
      items: itemsConPrecios,
      user_id: sessionData.session.user.id,
      status: "pending",
    },
  ]);

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
