// src/pages/api/auth/me.js

export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export async function GET({ cookies }) {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (error || !data.session) {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const authUser = data.session.user;

  // Buscar datos extra en la tabla perfiles
  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("username, role")
    .eq("id", authUser.id)
    .single();

  if (perfilError) {
    console.error("Error obteniendo perfil:", perfilError);
  }

  return new Response(
    JSON.stringify({
      user: {
        id: authUser.id,
        email: authUser.email,
        username: perfil?.username || authUser.email.split("@")[0],
        role: perfil?.role || "cliente",
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}