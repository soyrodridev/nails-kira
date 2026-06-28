export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const telefono = formData.get("telefono");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");


  if (!email || !username || !telefono || !password || !confirmPassword) {
    return new Response("Todos los campos son obligatorios", { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        telefono: telefono,
      },
    },
  });

  if (error) {
  console.error("Error completo:", JSON.stringify(error, null, 2));
  return new Response(error.message, { status: 400 });
}

  if (data?.session) {
    cookies.set("sb-access-token", data.session.access_token, { path: "/", httpOnly: true, secure: true });
    cookies.set("sb-refresh-token", data.session.refresh_token, { path: "/", httpOnly: true, secure: true });
    return redirect("/admin/dashboard");
  }

  return new Response("Cuenta creada exitosamente.", { status: 200 });
};