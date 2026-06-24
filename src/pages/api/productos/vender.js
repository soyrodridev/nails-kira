export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export const POST = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const productoId = formData.get("productoId");
    const nombreProducto = formData.get("nombreProducto");

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


    const { error: notiError } = await supabase
      .from("notificaciones")
      .insert([
        {
          mensaje: `¡Producto vendido! ${nombreProducto} (ID: ${productoId})`,
          leido: false,
          meta_id: productoId
        }
      ]);

    if (notiError) {
      console.error("Error al insertar en notificaciones:", notiError);
      throw notiError;
    }
    return new Response(JSON.stringify({ message: "Venta registrada" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Detalle del error en venta.js:", error);
    return new Response(error.message || "Error desconocido", { status: 500 });
  }
};