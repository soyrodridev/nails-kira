export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export const POST = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const username = formData.get("username");

    if (!username || !username.trim()) {
      return new Response("El nombre de usuario no puede estar vacío", { status: 400 });
    }

    // 1. Recuperar tokens de las cookies del servidor
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
      return new Response("No autorizado: Sesión faltante", { status: 401 });
    }

    // 2. Inicializar la sesión en el servidor para este hilo de ejecución
    await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    // 3. Actualizar la metadata del usuario de manera segura en el Servidor
    const { data, error } = await supabase.auth.updateUser({
      data: { username: username.trim() }
    });

    if (error) throw error;

    // 4. IMPORTANTE: Si Supabase devuelve nuevos tokens tras la actualización, los refrescamos en las cookies
    if (data?.session) {
      cookies.set("sb-access-token", data.session.access_token, { path: "/", httpOnly: true, secure: true });
      cookies.set("sb-refresh-token", data.session.refresh_token, { path: "/", httpOnly: true, secure: true });
    }

    return new Response("Perfil actualizado con éxito", { status: 200 });
  } catch (error) {
    return new Response(error.message || "Error al actualizar el perfil", { status: 500 });
  }
};