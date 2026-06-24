export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return new Response("Email y contraseña requeridos", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  const { access_token, refresh_token } = data.session;

  // AGREGAMOS sameSite: 'lax' y explicitamos los parámetros de seguridad
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: true, // Requerido para HTTPS
    sameSite: "lax", // CRUCIAL para evitar bloqueos en móviles
    maxAge: 60 * 60 * 24 * 7, // 7 días
  };

  cookies.set("sb-access-token", access_token, cookieOptions);
  cookies.set("sb-refresh-token", refresh_token, cookieOptions);

  return redirect("/admin/dashboard");
};