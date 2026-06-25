export const prerender = false;

import { supabaseClient as supabase } from "../../../lib/supabase";

export async function POST({ request, cookies }) {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return new Response(
      JSON.stringify({ error: "No autenticado" }),
      { status: 401 }
    );
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

  if (sessionError || !sessionData.session) {
    return new Response(
      JSON.stringify({ error: "Sesión inválida" }),
      { status: 401 }
    );
  }

  const body = await request.json();

  const orderData = {
    ...body,
    user_id: sessionData.session.user.id,
  };

  const { error } = await supabase
    .from("orders")
    .insert([orderData]);

  if (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
}