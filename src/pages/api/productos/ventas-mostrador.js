export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export const POST = async ({ request, cookies }) => {
  try {
    const { catalogoId, metodo } = await request.json(); // Solo para este uso

    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");
    
    if (!accessToken || !refreshToken) {
      return new Response("No autorizado", { status: 401 });
    }

    const { data: { user }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    if (sessionError || !user) {
      return new Response("Usuario no válido", { status: 401 });
    }

    // Aquí registras tu venta
    const { error: notiError } = await supabase
      .from("notificaciones")
      .insert([
        {
          mensaje: `¡Venta realizada en ${metodo}! ID: ${catalogoId}`,
          leido: false,
          meta_id: catalogoId
        }
      ]);

    if (notiError) throw notiError;

    return new Response(JSON.stringify({ message: "Venta registrada" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};