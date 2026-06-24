export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (!email || !username || !password || !confirmPassword) {
    return new Response("Todos los campos son obligatorios", { status: 400 });
  }

  if (password !== confirmPassword) {
    return new Response("Las contraseñas no coinciden", { status: 400 });
  }

  // Registramos pasando el username en los metadatos para que el Trigger lo lea
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  if (data?.session) {
    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, { path: "/", httpOnly: true, secure: true });
    cookies.set("sb-refresh-token", refresh_token, { path: "/", httpOnly: true, secure: true });
    return redirect("/admin/dashboard");
  }

  return new Response("Cuenta creada. Por favor, verifica tu correo electrónico para activarla.", { status: 200 });
};