export const prerender = false;

import { supabaseClient as supabase } from "../../../lib/supabase";

export async function GET({ cookies }) {
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

  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}